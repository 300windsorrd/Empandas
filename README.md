These Freakin’ Empanadas & More — Monorepo

- Packages
  - `packages/these-freakin-empanadas`: Publishable component library (default export + named exports) with strict API parity to La Reina template.
  - `apps/starter`: Next.js 14 sample app (public site + admin stub).

Quick Start

- Prereqs: Node 20+, PNPM 8+
- Install: `pnpm install`
- Dev app: `pnpm dev`
- Build all: `pnpm build`
- Lint/typecheck/tests: `pnpm lint && pnpm typecheck && pnpm test`
- Audits: `pnpm audit` (data + brand-color usage)

Environment

- Apps use `.env` variables:
  - `DATABASE_URL` (e.g., file:./dev.db for SQLite)
  - `DATABASE_PROVIDER` (e.g., `postgresql` or `sqlite`)
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (plain or bcrypt hash)

Data & Seeding

- Seed JSON lives at `/data/*.json` (repo root) and is copied for the app at `apps/starter/public/data/*`.
- `pnpm --filter ./apps/starter seed` reads those JSON files and (placeholder) writes to DB using Prisma.

Brand Rules

- Tokens: `--color-primary`, `--color-secondary`, `--color-brandRed`, `--color-accent`.
- Rule: `#02FCFD` is only for: 2px focus ring, tiny pill tags, subtle hover underline, micro-icons.
- Enforcement: CI runs an audit that fails on raw `#02FCFD` or when accent is used in `bg*/btn*` contexts.

Library Exports

- Default: `<TheseFreakinEmpanadas {...props} />`
- Named: `Header, Hero, HeroCarousel, FeaturedMenu, About, Reviews, Contact, OrderNowBanner, Footer, Utilities`
- Utilities: `formatPhoneNumber, generateGoogleMapsUrl, isMobile, isDesktop`

Props

- See `packages/these-freakin-empanadas/src/types.ts` for the exact prop and data types.

Admin Panel

- Auth wired via NextAuth Credentials (stub). Admin UI scaffolding at `apps/starter/app/(admin)/admin`.
- All write actions should be server actions guarded and revalidate tags: `menu`, `hero`, `settings`.

Testing & CI

- Unit tests via Vitest for utilities and validators.
- GitHub Actions CI runs: install → typecheck → lint → test → audit → build.

Notes

- Images should be self-hosted under `/public/images/*`. Replace placeholders with real assets.
- This scaffold focuses on structure, parity, and audits. Extend UI and admin features as needed.

