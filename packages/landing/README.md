# MyPg Landing Page

Dedicated landing page application for **MyPg: A PostgreSQL Backend as a Service**, separated from the main dashboard and API services.

## Architecture & Structure

- Package location: `packages/landing`
- Port: `3001` (to run alongside Dashboard on `3000` and API on `4000`)
- Built with: Next.js 15, React 19, Tailwind CSS, Lucide Icons
- Modular separation:
  - `src/components/landing/`: Hero, FeatureGrid, InteractiveTerminal, Architecture, Comparison, Benchmarks, Pricing, FAQ, CTA, QuickInstall, WaitlistForm
  - `src/components/layout/`: Navbar, Footer
  - `src/components/ui/`: Button, Badge, Card, Input, PostgresLogo
  - `src/app/privacy`: Privacy Policy
  - `src/app/terms`: Terms of Service
  - `src/app/not-found.tsx`: Custom 404 page
  - `src/app/sitemap.ts`: Dynamic XML Sitemap
  - `src/app/robots.ts`: Robots.txt
  - `src/app/icon.tsx`: Dynamic branded Favicon
  - `src/app/opengraph-image.tsx`: Dynamic 1200x630 OpenGraph Image

## Development

```bash
pnpm landing:dev
```

Open [http://localhost:3001](http://localhost:3001).

## Build & Test

```bash
pnpm landing:build
pnpm landing:test
```
