# CI Setup

GitHub Actions runs on every pull request and on pushes to `main`.

## Jobs

| Job | When | Command | Secrets |
|-----|------|---------|---------|
| **check** | PR + push to `main` | `npm run ci` | None |
| **ci-gate** | PR only | `npm run ci:gate` (+ migrate/seed) | Required |

### check (fast)

1. ESLint (`--max-warnings 0`)
2. TypeScript
3. Next.js production build
4. Vitest (unit, integration, public-privacy projects)

### ci-gate (heavy)

Runs after **check** passes:

1. Validates required GitHub secrets
2. `npm run build`
3. `npm run db:migrate` + `npm run db:seed`
4. `npm run test:architecture` — static access/privacy guards
5. `npm run test:integration` — Vitest integration project
6. `npm run test:e2e` — Playwright (smoke + a11y; grows with H3–H13)

## Required GitHub secrets (ci-gate)

Add under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Drizzle migrations, integration tests, E2E |
| `NEON_AUTH_BASE_URL` | Admin auth E2E (Phase 2+) |
| `NEON_AUTH_COOKIE_SECRET` | Admin session in E2E |

Optional until blob upload E2E:

| Secret | Purpose |
|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | Registration proof upload tests |

## Dependabot and fork PRs

- **Dependabot PRs** do not receive Actions secrets. Duplicate the same secret names under **Settings → Code security → Dependabot → Secrets**.
- **Fork PRs** do not receive repository secrets. `ci-gate` fails until a maintainer re-runs or merges from a branch in this repo.

## Local equivalents

```bash
npm run ci          # same as check job
npm run ci:gate     # architecture + integration + Playwright (needs .env.local)
npm run pr          # commit/PR fast gate (lint + typecheck + Vitest, no build)
```

## Not in CI

Per the implementation plan: Lighthouse, Sentry, and full `npm run prelaunch` manual checklist are pre-launch only.
