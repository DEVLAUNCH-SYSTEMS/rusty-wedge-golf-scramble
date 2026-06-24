# Rusty Wedge Golf Scramble

Registration and tournament management for the annual Rusty Wedge Golf Scramble.

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in DATABASE_URL and other vars — see docs/env-setup.md
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run check` | Lint, typecheck, Vitest (commit hook) |
| `npm run ci` | Full fast CI job (lint, typecheck, build, Vitest) |
| `npm run ci:gate` | PR gate (architecture guards, integration, Playwright) |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:seed` | Seed active 2026 tournament |
| `npm run qa:checklist` | Print pre-launch and post-event checklists |
| `npm run pr` | PR fast gate (lint, typecheck, Vitest) |

## Documentation

- [CI setup](./docs/ci-setup.md)
- [Environment setup](./docs/env-setup.md)
- [Database setup](./docs/database-setup.md)
- [Admin onboarding](./docs/admin-onboarding.md)
- [Pre-launch QA checklist](./docs/qa/prelaunch-checklist.md)
- [Post-event checklist](./docs/qa/post-event-checklist.md)
