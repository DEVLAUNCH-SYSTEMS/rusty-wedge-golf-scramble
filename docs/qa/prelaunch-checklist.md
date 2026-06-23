# Pre-Launch Checklist

Document pass/fail before production deploy. See [deployment.md](./deployment.md) for Vercel steps and [launch-handoff.md](./launch-handoff.md) for organizer walkthrough.

## Organizer sign-off

- [ ] **O1** Scott Wenzel Jr. (509-218-4650) and Rusty Williams (509-995-0269) approved for public website display
- [ ] **O2** Venmo handle finalized (replace `@RustyWedge` placeholder if needed)
- [ ] **O6** Each organizer has own Neon Auth account in `admin_users` ([admin onboarding](../admin-onboarding.md))

## Mobile and desktop upload QA

- [ ] **O3** Registration with payment screenshot from iPhone photo library
- [ ] **O4** Registration with payment screenshot from Android photo library
- [ ] **O5** Registration with payment screenshot from desktop file picker (JPG/PNG/PDF)

## Automated pre-launch

- [ ] **O7** `npm run prelaunch` passes (lint, typecheck, Vitest, security review, Playwright, Axe)
- [ ] `npm run security:review` passes (headers, rate limits, proof route, CSV export, PII-safe logs)

## Manual workflow smoke

- [ ] Full registration → pending review
- [ ] Admin verifies payment
- [ ] Waitlist form when at capacity
- [ ] Team assignment (max 4)
- [ ] CSV export (registrations + teams)
- [ ] Concurrent verify at capacity (T1)

## Security spot-check

- [ ] Public page shows no capacity counts or registration PII
- [ ] Unauthenticated `/admin` redirects
- [ ] Non-allowlisted user gets 403 on `/admin`
- [ ] Unauthenticated payment proof and CSV export routes return 401/403

## Deployment

- [ ] Production env vars synced in Vercel ([env-setup.md](../env-setup.md))
- [ ] `NEON_AUTH_BASE_URL` validated (`node scripts/validate-neon-auth-env.mjs`)
- [ ] Production migrations applied (`npm run db:migrate`)
- [ ] Post-deploy smoke test complete ([deployment.md](./deployment.md))
- [ ] Organizers received [launch-handoff.md](./launch-handoff.md)

## Optional (not blocking)

- [ ] Chrome DevTools Lighthouse on `/` — note any findings for follow-up

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Developer | | | `npm run prelaunch` + deploy smoke |
| Organizer | | | O1–O6 manual QA |
