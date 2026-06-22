# Pre-Launch Checklist

Document pass/fail before production deploy.

## Organizer sign-off

- [ ] **O1** Scott Wenzel Jr. (509-218-4650) and Rusty Williams (509-995-0269) approved for public website display
- [ ] **O2** Venmo handle finalized (replace `@RustyWedge` placeholder if needed)
- [ ] **O6** Each organizer has own Neon Auth account in `admin_users` ([admin onboarding](../admin-onboarding.md))

## Mobile and desktop upload QA

- [ ] **O3** Registration with payment screenshot from iPhone photo library
- [ ] **O4** Registration with payment screenshot from Android photo library
- [ ] **O5** Registration with payment screenshot from desktop file picker (JPG/PNG/PDF)

## Automated pre-launch

- [ ] **O7** `npm run prelaunch` passes (lint, typecheck, Vitest, Playwright, Axe)

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
