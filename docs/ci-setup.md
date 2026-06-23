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

Integration tests **skip automatically** when no database URL is configured (local `npm run check` stays fast).

### ci-gate (heavy)

Runs after **check** passes:

1. Validates required GitHub secrets
2. `npm run build`
3. `npm run db:migrate` + `npm run db:seed` against the **CI gate branch**
4. `npm run test:architecture` — static access/privacy guards
5. `npm run test:integration` — Vitest integration project (H1, H2, H4, H8, H9, H11, T26)
6. `npm run test:e2e` — Playwright smoke, admin auth, public privacy, Axe

## Required GitHub secrets (ci-gate)

Add under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Dedicated Neon **CI branch** — migrate, seed, integration, E2E |
| `DATABASE_URL_UNPOOLED` | Optional direct Neon URL for `db:migrate` (recommended if pooled) |
| `NEON_AUTH_BASE_URL` | Neon Auth project URL (dev/staging; not production-only). Must be an absolute URL; `https://` is added automatically if omitted. |
| `NEON_AUTH_COOKIE_SECRET` | Session signing secret for E2E (can match dev) |

On GitHub, `DATABASE_URL` should point at your isolated CI branch (same database the ci-gate job uses — you do not need a separate secret name).

**Local only:** if your dev `.env.local` uses a different `DATABASE_URL`, add `CI_GATE_DATABASE_URL` (+ optional `_UNPOOLED`) for the CI branch and run `npm run ci:gate` or `npm run db:migrate:ci`. Those vars are not required in GitHub Actions.

Optional until blob upload E2E:

| Secret | Purpose |
|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | Registration proof upload tests |

### CI database vs production (important)

`ci-gate` runs `npm run db:migrate` and `npm run db:seed` so integration and E2E tests have a real schema and seed data. **This must never target your production database.**

Recommended Neon setup:

1. Create a dedicated branch (e.g. `ci`) — **from an empty parent**, not a copy of production data.
2. Add GitHub secrets `DATABASE_URL` (+ optional `DATABASE_URL_UNPOOLED`) for that branch.
3. Keep production `DATABASE_URL` only in **Vercel Production** — not in GitHub Actions.

If you branched `ci` **from production**, migrate may fail unless Drizzle history matches. Fix: reset the `ci` branch in Neon so migrate can run cleanly.

At launch, apply production migrations in a controlled deploy step (manual or a `main`-only workflow), separate from PR `ci-gate`.

## Local CI gate database

Add to `.env.local`:

```bash
# Dev app reads this
DATABASE_URL=postgresql://...your-dev-branch...

# CI gate tests/migrate use this (never production)
CI_GATE_DATABASE_URL=postgresql://...your-ci-branch...
CI_GATE_DATABASE_URL_UNPOOLED=postgresql://...direct-ci-branch...  # optional
```

Run migrate/seed against the CI branch without touching dev:

```bash
npm run db:migrate:ci
npm run db:seed:ci
```

Run the full gate locally (uses `CI_GATE_*` when `RUN_CI_GATE=1`):

```bash
npm run ci:gate
```

## Dependabot and fork PRs

- **Dependabot PRs** do not receive Actions secrets. Duplicate the same secret names under **Settings → Code security → Dependabot → Secrets**.
- **Fork PRs** do not receive repository secrets. `ci-gate` fails until a maintainer re-runs or merges from a branch in this repo.

## Local equivalents

```bash
npm run ci          # same as check job
npm run ci:gate     # architecture + integration + Playwright (needs CI_GATE_* in .env.local)
npm run pr          # commit/PR fast gate (lint + typecheck + Vitest, no build)
```

Pre-commit hook runs `npm run check` + `npm run test:public-privacy`.

## Not in CI

Per the implementation plan: Lighthouse, Sentry, and full `npm run prelaunch` manual checklist are pre-launch only.
