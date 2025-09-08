export const runtime = 'edge';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const urls = [
    '/',
  ];
  const lastmod = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${origin}${u}</loc><changefreq>weekly</changefreq><lastmod>${lastmod}</lastmod></url>`
  )
  .join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

