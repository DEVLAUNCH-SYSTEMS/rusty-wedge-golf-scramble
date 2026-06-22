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
| `DATABASE_URL` | CI/test Neon branch — seed, integration tests, E2E (pooled is OK) |
| `DATABASE_URL_UNPOOLED` | Optional direct Neon URL for `db:migrate` (recommended if `DATABASE_URL` is pooled) |
| `NEON_AUTH_BASE_URL` | Neon Auth project URL (dev/staging; not production-only) |
| `NEON_AUTH_COOKIE_SECRET` | Session signing secret for E2E (can match dev) |

You can either:

- Set **`DATABASE_URL`** to the unpooled CI branch URL (simplest), or
- Set **`DATABASE_URL`** to pooled + **`DATABASE_URL_UNPOOLED`** to direct (CI passes both to the job).

Optional until blob upload E2E:

| Secret | Purpose |
|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | Registration proof upload tests |

### CI database vs production (important)

`ci-gate` runs `npm run db:migrate` and `npm run db:seed` so integration and E2E tests have a real schema and seed data. **This must never target your production database.**

Recommended Neon setup:

1. Create a dedicated branch (e.g. `ci`) — **from an empty parent**, not a copy of production data.
2. Add GitHub secrets for that branch (see table above).
3. Keep production `DATABASE_URL` only in **Vercel Production** — not in GitHub Actions.

If you branched `ci` **from production**, it already contains prod schema. Migrate then fails unless Drizzle’s `drizzle.__drizzle_migrations` table matches. Fix: in Neon, **reset** the `ci` branch (or delete and recreate from empty `main`) so migrate can run cleanly.

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
