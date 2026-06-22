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
| `DATABASE_URL` | **CI/test Neon branch only** — migrations, integration tests, E2E |
| `NEON_AUTH_BASE_URL` | Neon Auth project URL (dev/staging; not production-only) |
| `NEON_AUTH_COOKIE_SECRET` | Session signing secret for E2E (can match dev) |

Optional until blob upload E2E:

| Secret | Purpose |
|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | Registration proof upload tests |

### CI database vs production (important)

`ci-gate` runs `npm run db:migrate` and `npm run db:seed` so integration and E2E tests have a real schema and seed data. **This must never target your production database.**

Recommended Neon setup:

1. Create a dedicated branch (e.g. `ci` or `staging`) in your Neon project.
2. Copy that branch’s **direct (unpooled)** connection string into the GitHub `DATABASE_URL` secret.
3. Keep production `DATABASE_URL` only in **Vercel Production** environment variables — not in GitHub Actions.

At launch, apply production migrations in a controlled deploy step (manual or a `main`-only workflow), separate from PR `ci-gate`.

If migrate fails with exit code 1 and little output, common causes:

- GitHub secret points at a DB that already has schema but no Drizzle migration history → use a fresh CI branch or reset the branch.
- Pooled connection string (`-pooler` host) used for DDL → use the direct/unpooled URL (or set `DATABASE_URL_UNPOOLED` in the secret).
- Same URL as local dev where you already migrated manually → usually fine; Drizzle skips applied migrations. A partial/failed prior run may require a clean branch.

`db:seed` is idempotent; re-running on an already-seeded CI branch is safe.

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
