These Freakin’ Empanadas & More — Full Stack Template

Overview

- Modern, modular site package with secure admin, matching La Reina API parity and ergonomics. Includes publishable component library + starter Next.js app, strict brand enforcement, data audits, tests, E2E + a11y, and CI quality gates.

Packages

- Library: `packages/these-freakin-empanadas` (default export + named sections, UI primitives, utilities)
- App: `apps/starter` (public site + admin panel, Prisma + NextAuth wired)

Quick Start

- Requirements: Node 20+, PNPM 8+
- Install deps: `pnpm install`
- App env: copy `apps/starter/.env.example` → `apps/starter/.env` and adjust
- Generate client: `pnpm -C apps/starter prisma:generate`
- Dev DB + seed: `pnpm -C apps/starter prisma:migrate && pnpm -C apps/starter seed`
- Run app: `pnpm dev` (http://localhost:3000)

Top-Level Scripts

- Typecheck/Lint/Test: `pnpm typecheck && pnpm lint && pnpm test`
- Audits (data + brand): `pnpm audit`
- CI Lighthouse: `pnpm lhci` (uses lighthouserc.cjs)

Brand Rules (Enforced)

- Tokens: `--color-primary`, `--color-secondary`, `--color-brandRed`, `--color-accent`
- Rule: Never use raw `#02FCFD`; accent only for 2px focus ring, tiny pills, subtle underline, micro-icons
- Enforcement:
  - ESLint plugin `eslint-plugin-tfe` rule `tfe/no-bad-accent-usage`
  - Audit script scans classNames/CSS for raw hex and bg/btn misuse

Library Exports

- Default: `<TheseFreakinEmpanadas {...props} />`
- Sections: `Header, Hero, HeroCarousel, FeaturedMenu, About, Reviews, Contact, OrderNowBanner, Footer`
- UI: `Button, Card, Input, Dialog, Tooltip, Tabs`
- Utilities: `formatPhoneNumber, generateGoogleMapsUrl, isMobile, isDesktop`
- Types: `HeroImage, MenuItem, CustomStyles, TheseFreakinEmpanadasProps`

Design & A11y

- Fonts via next/font: Source Sans (headings) + Lato (body), display=swap
- Fluid typography via CSS clamp, WCAG AA contrast, keyboard-first, reduced-motion respected
- Focus: only accent ring (2px), consistent skip link; Tooltips on disabled CTAs show “Temporarily unavailable”

Data & DB

- Seeds: `data/menu.json`, `data/hero.json` (root) mirrored under `apps/starter/public/data/*`
- Prisma models: MenuItem, MenuItemDraft, HeroSlide, Settings, User, ChangeLog
- Draft/Publish: Draft tables hold edits; publish copies into live tables and writes ChangeLog
- Seed: loads JSON → DB with normalized fields

Admin Panel

- Tabs: Menu (inline edit + CSV import/export with dry-run), Carousel (reorder), Settings (address/phone/platform URLs), Publishing (publish drafts, revalidateTag), Change Log (audit trail)
- Security: NextAuth Credentials with lockout (5 tries, 15min), password change flow, optional TOTP 2FA
- Rate limiting: per-user action limits (server-side)
- Uploads: `/api/upload` validates type/size/dimensions; converts to WEBP; strips EXIF; stores under `/public/uploads`

Auth

- Credentials login; either DB user (Prisma) or fallback ADMIN_EMAIL/ADMIN_PASSWORD
- 2FA: TOTP via otplib; QR enrollment; verification on login when enabled
- Password change: server action validates current password and updates hash

SEO & Performance

- Metadata per page; canonical via `metadataBase`
- JSON-LD: Restaurant + Menu/MenuSection/MenuItem/Offer injected server-side
- Sitemap at `app/sitemap.ts`; robots headers set based on env
- Lighthouse CI thresholds: Perf ≥ 0.90, A11y ≥ 0.95, BP ≥ 0.95, SEO ≥ 0.95

Testing & Quality Gates

- Unit: Vitest for utilities and validators
- E2E: Playwright with `@axe-core/playwright` a11y assertions; webServer starts Next build automatically
- Audits: `scripts/audit-data.ts` (data invariants), `scripts/audit-brand-colors.ts` (brand enforcement)
- CI: GitHub Actions runs install → typecheck → lint → unit tests → audits → build → Playwright → Lighthouse

Environment

- apps/starter/.env:
  - `DATABASE_PROVIDER=sqlite`
  - `DATABASE_URL="file:./dev.db"` (or Postgres URL in prod)
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (bcrypt or plain for dev)
  - Optional: `SENTRY_DSN`

Developer Workflow

- Edit content in Admin → Save Draft → Publishing → Publish Drafts
- Revalidation: publish actions call `revalidateTag('menu'|'hero'|'settings')`
- CSV import/export: use Menu tab actions; dry-run shows diffs first
- Images: upload via `/api/upload` or place under `apps/starter/public/images`

File Map (highlights)

- Root
  - `pnpm-workspace.yaml`, `package.json` (workspace scripts), `.github/workflows/ci.yml`
  - `scripts/audit-data.ts`, `scripts/audit-brand-colors.ts`, `lighthouserc.cjs`
  - `data/menu.json`, `data/hero.json`
- Library
  - `packages/these-freakin-empanadas/src/index.ts` (exports)
  - `packages/these-freakin-empanadas/src/components/sections/*` (site sections)
  - `packages/these-freakin-empanadas/src/utilities.ts` (Utilities)
- App
  - `apps/starter/app/page.tsx` (site + JSON-LD)
  - `apps/starter/app/(admin)/admin/*` (admin UI)
  - `apps/starter/src/lib/*` (auth, db, validators, cache, seo)
  - `apps/starter/src/server/actions/*` (server actions: admin, account)
  - `apps/starter/prisma/schema.prisma` (DB models)

Acceptance Notes (Parity)

- Props and exports match La Reina template names and defaults
- FeaturedMenu shows DoorDash and Grubhub prices side-by-side; missing links render disabled buttons with tooltip
- Price footer copy: “Prices set by platform • Last checked: YYYY-MM-DD”
- Build fails on data or brand audit errors
- Admin publishes trigger `revalidateTag` and reflect on site
- WCAG AA met; keyboard-first UX; prefers-reduced-motion respected

Beautiful UX

- Clean, high-contrast theme, fluid type, subtle Framer Motion micro-interactions in Hero, sticky header, consistent spacing, and tactile buttons
Maintenance

- Migrations: `pnpm -C apps/starter prisma:migrate`
- Seeding: `pnpm -C apps/starter seed`
- Tests: `pnpm test` (unit) and `pnpm -C apps/starter exec playwright test` (E2E)
- Audits: `pnpm audit`

Questions or enhancements you want prioritized next? Admin CSV diff UI, full drag-and-drop for Carousel, or editor RBAC.
