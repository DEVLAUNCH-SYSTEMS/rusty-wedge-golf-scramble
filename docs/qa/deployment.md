# Production Deployment

Deploy to Vercel after automated pre-launch checks pass locally or in CI.

## Prerequisites

- Vercel project linked to this repository
- Neon **production** branch (separate from CI/test branch)
- Neon Auth project URL and cookie secret
- Vercel Blob store linked ([blob-setup.md](../blob-setup.md))
- Organizers ready to complete [launch-handoff.md](./launch-handoff.md) manual items

## 1. Sync environment variables

Add to Vercel → **Settings** → **Environment Variables** for **Production** (and Preview if needed):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Production Neon branch only |
| `NEON_AUTH_BASE_URL` | Full URL; `https://` added automatically if omitted |
| `NEON_AUTH_COOKIE_SECRET` | 32+ characters; unique per environment |
| `BLOB_STORE_ID` | From linked Vercel Blob store |
| `BLOB_READ_WRITE_TOKEN` | If not using OIDC-only auth |

See [env-setup.md](../env-setup.md) for details. Never point production `DATABASE_URL` at the CI/test branch.

Validate auth URL format locally:

```bash
NEON_AUTH_BASE_URL="your-neon-auth-url" node scripts/validate-neon-auth-env.mjs
```

## 2. Apply database migrations

Run against the **production** branch before or immediately after the first deploy:

```bash
DATABASE_URL="postgresql://..." npm run db:verify-target
DATABASE_URL="postgresql://..." npm run db:migrate
```

Seed the active tournament only on a fresh production database:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

Update `venmo_handle` and other tournament fields in Neon if the seed placeholder (`@RustyWedge`) is still present.

## 3. Run pre-launch automation

From a clean checkout with production-like env available for E2E (or after CI gate passes on the release PR):

```bash
npm run prelaunch
```

This runs lint, typecheck, Vitest, security review, Playwright E2E, Axe, and prints the manual QA checklist.

## 4. Deploy

Push to `main` (or promote a Vercel deployment) after:

- [ ] `npm run prelaunch` passes
- [ ] `npm run security:review` passes
- [ ] Manual items in [prelaunch-checklist.md](./prelaunch-checklist.md) are signed off (O1–O7)

## 5. Post-deploy smoke test

| Check | Expected |
|-------|----------|
| `GET /` | Landing page loads; no numeric capacity counts |
| `GET /admin` | Redirects unauthenticated users to `/auth/sign-in` |
| Registration form | Submits to `pending_review` when capacity available |
| Admin sign-in | Allowlisted organizer reaches `/admin` dashboard |
| CSV exports | Authenticated admin can download registrations + teams |
| Vercel logs | No unexpected 5xx spikes after deploy |

Optional: run Playwright against production:

```bash
PLAYWRIGHT_BASE_URL="https://your-production-domain" npx playwright test e2e/smoke.spec.ts e2e/public-privacy.spec.ts
```

Do not run destructive E2E flows against production.

## 6. Admin onboarding

Each organizer needs their own Neon Auth account and `admin_users` row. See [admin-onboarding.md](../admin-onboarding.md).

## 7. Monitoring (V1)

- **Vercel** → Logs and Errors dashboards
- No Sentry in V1
- Organizers report issues via direct contact; document in `admin_notes` when relevant

## 8. Hand off to organizers

Walk organizers through [launch-handoff.md](./launch-handoff.md) covering event-day exports and post-event shutdown.
