
#!/usr/bin/env python3
"""Image Scraper
------------------
Reads URLs from a README/Links markdown file and downloads images
from supported sources into per-source folders inside ./images.

Features
- Modular, per-source extractors (Yelp, DoorDash, NorthJersey, Grubhub, generic)
- Requests+BeautifulSoup first; optional Playwright fallback for JS-heavy pages
- Robust URL extraction from Markdown (raw links, <angle>, and [text](url))
- Deduplicated downloads with SHA1 filenames and proper extensions via Content-Type
- Session with retries, polite rate limiting, and user-agent
- Per-page Referer on image downloads to bypass hotlink/CDN checks
- Playwright-aware re-download on 403/406 using browser cookies
- Broad image type support (AVIF/WEBP/SVG/ICO/HEIC/JP2/JXL/etc.) and <picture><source> parsing
- Clear logging and summary report
"""
import argparse
import hashlib
import mimetypes
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter, Retry

# ------------------------------ Config & Utilities ------------------------------

SUPPORTED_SOURCES: Dict[str, str] = {
    "yelp": "yelp-imgs",
    "doordash": "doordash-imgs",
    "northjersey": "northjersey-imgs",
    "grubhub": "grubhub-imgs",
}

IMG_EXT_WHITELIST = {
    ".jpg", ".jpeg", ".pjpeg", ".png", ".gif", ".webp", ".avif",
    ".bmp", ".tiff", ".tif", ".svg", ".ico", ".jfif", ".jxl",
    ".jp2", ".jpx", ".jpm", ".jxr", ".heic", ".heif"
}
CONTENT_TYPE_TO_EXT = {
    "image/pjpeg": ".jpg",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/svg+xml": ".svg",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "image/jxl": ".jxl",
    "image/jxr": ".jxr",
    "image/jp2": ".jp2",
    "image/jpx": ".jpx",
    "image/jpm": ".jpm",
}

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}

MARKDOWN_URL_RE = re.compile(
    r"""(?:
          <(https?://[^>\s]+)>               # <angle-bracketed>
        | \((https?://[^)\s]+)\)           # (paren-wrapped) as in [text](url)
        | \b(https?://[^\s)]+)              # bare URLs
    )""",
    re.X | re.I,
)

def sha1_name(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8", errors="ignore")).hexdigest()

def guess_ext(url: str, content_type: Optional[str]) -> str:
    path_ext = Path(urlparse(url).path).suffix.lower()
    if path_ext in IMG_EXT_WHITELIST:
        return path_ext
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        if ct in CONTENT_TYPE_TO_EXT:
            return CONTENT_TYPE_TO_EXT[ct]
        # Fallback to mimetypes
        ext = mimetypes.guess_extension(ct)
        if ext:
            return ext
    # Conservative default
    return ".jpg"

def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def domain_key(url: str) -> Optional[str]:
    host = urlparse(url).hostname or ""
    host = host.lower()
    for key in SUPPORTED_SOURCES.keys():
        if key in host:
            return key
    return None

def uniq(seq: Iterable[str]) -> List[str]:
    seen: Set[str] = set()
    out: List[str] = []
    for x in seq:
        if x not in seen:
            out.append(x); seen.add(x)
    return out

def sanitize_img_url(u: str) -> str:
    if not u:
        return u
    u = u.strip()
    if u.endswith("%20"):
        u = u[:-3]
    return re.sub(r"\s+", "", u)

def host_of(u: str) -> str:
    return (urlparse(u).hostname or "").lower()

# ------------------------------ ImageScraper ------------------------------

@dataclass
class ScrapeStats:
    pages_seen: int = 0
    images_found: int = 0
    images_downloaded: int = 0
    images_failed: int = 0

class ImageScraper:
    def __init__(
        self,
        readme_path: Path,
        images_dir: Path,
        use_playwright: Optional[bool] = None,
        delay_sec: float = 0.5,
        timeout: int = 20,
        max_retries: int = 3,
    ):
        self.readme_path = Path(readme_path)
        self.images_dir = Path(images_dir)
        self.delay_sec = delay_sec
        self.timeout = timeout
        self.stats = ScrapeStats()

        # Decide whether to try Playwright
        if use_playwright is None:
            try:
                import importlib
                importlib.import_module("playwright.sync_api")
                self.use_playwright = True
            except Exception:
                self.use_playwright = False
        else:
            self.use_playwright = use_playwright

        # Requests Session with retries
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        retries = Retry(
            total=max_retries,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD"]
        )
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # Prepare directories
        ensure_dir(self.images_dir)
        for folder in SUPPORTED_SOURCES.values():
            ensure_dir(self.images_dir / folder)

    # ------------------------------ High-level API ------------------------------
    def run(self) -> None:
        links = self._read_links(self.readme_path)
        if not links:
            print(f"No links found in {self.readme_path}")
            return

        print(f"Found {len(links)} URL(s) in {self.readme_path}")
        for url in links:
            src_key = domain_key(url)
            if not src_key:
                print(f"[skip] Unknown/unsupported source for {url}")
                continue
            folder = self.images_dir / SUPPORTED_SOURCES[src_key]
            self._scrape_page(url, src_key, folder)
            time.sleep(self.delay_sec)

        # Summary
        print("\n== Summary ==")
        print(f"Pages seen:        {self.stats.pages_seen}")
        print(f"Images discovered: {self.stats.images_found}")
        print(f"Images saved:      {self.stats.images_downloaded}")
        print(f"Images failed:     {self.stats.images_failed}")

    # ------------------------------ Link Reading ------------------------------
    def _read_links(self, path: Path) -> List[str]:
        text = path.read_text(encoding="utf-8", errors="ignore")
        urls = []
        for m in MARKDOWN_URL_RE.finditer(text):
            url = next(g for g in m.groups() if g)
            urls.append(url)
        # Filter to supported domains only, but keep ordering & dedupe
        urls = [u for u in urls if domain_key(u)]
        return uniq(urls)

    # ------------------------------ Page Scraping ------------------------------
    def _scrape_page(self, url: str, src_key: str, out_dir: Path) -> None:
        print(f"\n[page] {url} -> {out_dir.name}")
        self.stats.pages_seen += 1

        html = self._fetch_html(url)
        image_urls: List[str] = []
        if html:
            soup = BeautifulSoup(html, "html.parser")
            image_urls.extend(self._extract_general_images(url, soup))
            # Source-specific passes (prioritize domain logic)
            if src_key == "yelp":
                image_urls.extend(self._extract_yelp(url, soup))
            elif src_key == "northjersey":
                image_urls.extend(self._extract_northjersey(url, soup))
            elif src_key == "grubhub":
                image_urls.extend(self._extract_grubhub(url, soup))
            elif src_key == "doordash":
                image_urls.extend(self._extract_doordash(url, soup))

        image_urls = [sanitize_img_url(self._normalize_img_url(url, u)) for u in image_urls]
        image_urls = [u for u in image_urls if self._is_image_like(u)]
        image_urls = uniq(image_urls)

        if not image_urls and self.use_playwright:
            print("[info] No images via requests/bs4; trying Playwright…")
            image_urls = self._extract_with_playwright(url, src_key)
            image_urls = [u for u in image_urls if self._is_image_like(u)]
            image_urls = [sanitize_img_url(u) for u in image_urls]
            image_urls = uniq(image_urls)

        if not image_urls:
            print("[warn] No images found.")
            return

        print(f"[info] Found {len(image_urls)} candidate image URL(s)")
        self.stats.images_found += len(image_urls)
        self._download_all(image_urls, out_dir, page_url=url)

    def _fetch_html(self, url: str) -> Optional[str]:
        try:
            r = self.session.get(url, headers={**DEFAULT_HEADERS, "Accept": DEFAULT_HEADERS.get("Accept", "*/*")}, timeout=self.timeout)
            r.raise_for_status()
            return r.text
        except Exception as e:
            print(f"[warn] Failed to fetch HTML: {e}")
            return None

    # ------------------------------ Extractors ------------------------------
    def _extract_general_images(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        urls: Set[str] = set()
        # <img src>, data-src, data-lazy, data-original
        for img in soup.find_all("img"):
            for attr in ("src", "data-src", "data-lazy", "data-original"):
                v = img.get(attr)
                if v:
                    urls.add(v)
            # srcset (multiple candidates)
            srcset = img.get("srcset")
            if srcset:
                for part in srcset.split(","):
                    cand = part.strip().split(" ")[0]
                    if cand:
                        urls.add(cand)
        # <source> in <picture> blocks (often holds AVIF/WEBP variants)
        for src in soup.find_all("source"):
            typ = (src.get("type") or "").lower()
            if (typ.startswith("image/") or typ in ("avif", "webp")) or src.get("srcset"):
                ss = src.get("srcset") or ""
                for part in ss.split(","):
                    cand = part.strip().split(" ")[0]
                    if cand:
                        urls.add(cand)
            s = src.get("src")
            if s:
                urls.add(s)
        # CSS inline background-image
        for tag in soup.find_all(style=True):
            style = tag.get("style") or ""
            m = re.search(r"background-image\s*:\s*url\((['\"]?)([^'\")]+)\1\)", style, flags=re.I)
            if m:
                urls.add(m.group(2))
        # OpenGraph / Twitter cards
        for sel, attr in (("meta[property='og:image']", "content"),
                          ("meta[name='twitter:image']", "content")):
            for tag in soup.select(sel):
                v = tag.get(attr)
                if v:
                    urls.add(v)
        return list(urls)

    def _extract_yelp(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        urls: Set[str] = set()
        for img in soup.find_all("img"):
            for attr in ("src", "data-src", "data-original"):
                v = img.get(attr)
                if v and ("photo" in v or "bphoto" in v):
                    urls.add(v)
            srcset = img.get("srcset")
            if srcset and ("photo" in srcset or "bphoto" in srcset):
                for part in srcset.split(","):
                    cand = part.strip().split(" ")[0]
                    if cand:
                        urls.add(cand)
        for tag in soup.find_all(style=True):
            style = tag.get("style") or ""
            m = re.search(r"url\((['\"]?)([^'\")]+)\1\)", style, flags=re.I)
            if m and ("photo" in m.group(2) or "bphoto" in m.group(2)):
                urls.add(m.group(2))
        for tag in soup.select("meta[property='og:image']"):
            v = tag.get("content")
            if v:
                urls.add(v)
        return list(urls)

    def _extract_northjersey(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        urls: Set[str] = set()
        tag = soup.find("meta", attrs={"property": "og:image"})
        if tag and tag.get("content"):
            urls.add(tag["content"])
        for img in soup.select("figure img, article img, img[src]"):
            for attr in ("src", "data-src", "data-original"):
                v = img.get(attr)
                if v:
                    urls.add(v)
            ss = img.get("srcset")
            if ss:
                for part in ss.split(","):
                    cand = part.strip().split(" ")[0]
                    if cand:
                        urls.add(cand)
        return list(urls)

    def _extract_grubhub(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        return self._extract_general_images(base_url, soup)

    def _extract_doordash(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        return self._extract_general_images(base_url, soup)

    def _is_image_like(self, url: str) -> bool:
        if not url:
            return False
        u = url
        path = urlparse(u).path.lower()
        ext = Path(path).suffix.lower()
        if ext in IMG_EXT_WHITELIST:
            return True
        # Query-parameter hints (common on CDNs)
        q = urlparse(u).query.lower()
        if any(k in q for k in ("format=webp", "format=avif", "format=jpeg", "format=jpg", "format=png", "format=gif", "format=svg")):
            return True
        # Heuristic CDN patterns
        if any(k in u.lower() for k in ("/photo/", "bphoto", "image/upload", "/media/", "/images/", "img.cdn", "gcdn/", "presto/")) and ("http" in u):
            return True
        return False

    # ------------------------------ Playwright-aware downloader (fallback) ------------------------------
    def _playwright_download(self, img_url: str, out_dir: Path, page_url: str) -> bool:
        try:
            from playwright.sync_api import sync_playwright
        except Exception:
            return False

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent=DEFAULT_HEADERS["User-Agent"],
                    viewport={"width": 1600, "height": 1000},
                )
                if page_url:
                    try:
                        page = context.new_page()
                        page.goto(page_url, timeout=60_000, wait_until="domcontentloaded")
                        page.wait_for_timeout(2000)
                    except Exception:
                        pass

                resp = context.request.get(
                    img_url,
                    headers={
                        "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
                        "Referer": page_url or f"{urlparse(img_url).scheme}://{urlparse(img_url).hostname}",
                    },
                    timeout=60_000,
                )
                if resp.ok:
                    ct = resp.headers.get("content-type", "")
                    ext = guess_ext(img_url, ct)
                    name = sha1_name(img_url) + ext
                    fpath = out_dir / name
                    with open(fpath, "wb") as f:
                        f.write(resp.body())
                    print(f"[save:pw] {fpath.name}")
                    context.close()
                    browser.close()
                    return True
                else:
                    print(f"[fail:pw] {img_url} -> HTTP {resp.status}")
                    context.close()
                    browser.close()
                    return False
        except Exception as e:
            print(f"[fail:pw] {img_url} -> {e}")
            return False

    # ------------------------------ Playwright Fallback ------------------------------
    def _extract_with_playwright(self, url: str, src_key: str) -> List[str]:
        try:
            from playwright.sync_api import sync_playwright
        except Exception as e:
            print(f"[warn] Playwright not available: {e}")
            return []

        out: Set[str] = set()
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent=DEFAULT_HEADERS["User-Agent"],
                    viewport={"width": 1600, "height": 1000},
                )
                page = context.new_page()
                page.goto(url, timeout=60_000, wait_until="domcontentloaded")

                # Give time for lazy images to hydrate and scroll to trigger lazy loading
                page.wait_for_timeout(2_000)
                for _ in range(8):
                    page.mouse.wheel(0, 1200)
                    page.wait_for_timeout(800)
                if src_key == "yelp":
                    try:
                        grid_imgs = page.query_selector_all("img")
                        if grid_imgs:
                            grid_imgs[0].scroll_into_view_if_needed()
                            page.wait_for_timeout(500)
                    except Exception:
                        pass
                page.wait_for_timeout(7_000)

                # Gather <img> attributes
                img_handles = page.query_selector_all("img")
                for img in img_handles:
                    for attr in ("src", "data-src", "data-original", "data-lazy"):
                        v = img.get_attribute(attr)
                        if v:
                            out.add(v)
                    ss = img.get_attribute("srcset")
                    if ss:
                        for part in ss.split(","):
                            cand = part.strip().split(" ")[0]
                            if cand:
                                out.add(cand)

                # <source> elements (picture variants like avif/webp)
                src_nodes = page.query_selector_all("source")
                for node in src_nodes:
                    ss = node.get_attribute("srcset") or ""
                    for part in ss.split(","):
                        cand = part.strip().split(" ")[0]
                        if cand:
                            out.add(cand)
                    s = node.get_attribute("src")
                    if s:
                        out.add(s)

                # CSS backgrounds
                nodes = page.query_selector_all("[style*=background-image]")
                for node in nodes:
                    style = node.get_attribute("style") or ""
                    m = re.search(r"url\((['\"]?)([^'\")]+)\1\)", style, flags=re.I)
                    if m:
                        out.add(m.group(2))

                # OG/Twitter images
                for sel in ["meta[property='og:image']", "meta[name='twitter:image']"]:
                    for el in page.query_selector_all(sel):
                        v = el.get_attribute("content")
                        if v:
                            out.add(v)

                if src_key == "yelp":
                    out = {u for u in out if ("photo" in u or "bphoto" in u) or self._is_image_like(u)}
                context.close()
                browser.close()
        except Exception as e:
            print(f"[warn] Playwright extraction failed: {e}")
            return []

        # Normalize and filter
        out_list = [self._normalize_img_url(url, u) for u in out]
        out_list = [u for u in out_list if self._is_image_like(u)]
        return uniq(out_list)

    # ------------------------------ URL Helpers ------------------------------
    def _normalize_img_url(self, base_url: str, u: str) -> str:
        if not u:
            return u
        if u.startswith("//"):  # protocol-relative
            u = ("https:" if base_url.startswith("https") else "http:") + u
        elif u.startswith("/"):
            u = urljoin(base_url, u)
        return u

    # ------------------------------ Downloading ------------------------------
    def _download_all(self, urls: List[str], out_dir: Path, page_url: str = "") -> None:
        for u in urls:
            self._download_one(u, out_dir, page_url)
            time.sleep(self.delay_sec)

    def _download_one(self, url: str, out_dir: Path, page_url: str = "") -> None:
        try:
            headers = {
                "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
                "Referer": page_url or (f"{urlparse(url).scheme}://{urlparse(url).hostname}")
            }
            r = self.session.get(url, headers=headers, timeout=self.timeout, stream=True)
            r.raise_for_status()
            ext = guess_ext(url, r.headers.get("Content-Type"))
            name = sha1_name(url) + ext
            fpath = out_dir / name
            with open(fpath, "wb") as f:
                for chunk in r.iter_content(chunk_size=64 * 1024):
                    if chunk:
                        f.write(chunk)
            self.stats.images_downloaded += 1
            print(f"[save] {fpath.name}")
        except Exception as e:
            self.stats.images_failed += 1
            print(f"[fail] {url} -> {e}")
            if self.use_playwright and any(code in str(e) for code in ("403", "406")):
                ok = self._playwright_download(url, out_dir, page_url)
                if ok:
                    self.stats.images_failed -= 1
                    self.stats.images_downloaded += 1

# ------------------------------ CLI ------------------------------
def parse_args(argv: Optional[List[str]] = None):
    ap = argparse.ArgumentParser(description="Image Scraper: download images from URLs in a markdown file.")
    ap.add_argument("--readme", default="Links.md", type=Path, help="Path to README/Links markdown file (default: Links.md)")
    ap.add_argument("--images-dir", default=Path("images"), type=Path, help="Output images directory (default: ./images)")
    ap.add_argument("--no-playwright", action="store_true", help="Disable Playwright fallback even if installed")
    ap.add_argument("--delay", type=float, default=0.5, help="Delay between requests/downloads in seconds (default: 0.5)")
    ap.add_argument("--timeout", type=int, default=20, help="HTTP timeout seconds (default: 20)")
    ap.add_argument("--retries", type=int, default=3, help="Max HTTP retries for requests (default: 3)")
    return ap.parse_args(argv)

def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    scraper = ImageScraper(
        readme_path=args.readme,
        images_dir=args.images_dir,
        use_playwright=(False if args.no_playwright else None),
        delay_sec=args.delay,
        timeout=args.timeout,
        max_retries=args.retries,
    )
    scraper.run()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
