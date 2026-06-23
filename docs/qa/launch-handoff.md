# Launch Handoff (Organizers)

One-page guide for tournament organizers before and after go-live. Developers complete technical deploy steps in [deployment.md](./deployment.md).

## Before launch — organizer sign-off

Complete every item in [prelaunch-checklist.md](./prelaunch-checklist.md):

| Item | What you do |
|------|-------------|
| **O1** | Confirm Scott Wenzel Jr. (509-218-4650) and Rusty Williams (509-995-0269) are approved on the public site |
| **O2** | Confirm the Venmo handle is correct (not the `@RustyWedge` placeholder) |
| **O3** | Register on an **iPhone** using a photo-library payment screenshot |
| **O4** | Register on an **Android** phone using a photo-library payment screenshot |
| **O5** | Register on **desktop** using JPG, PNG, or PDF from the file picker |
| **O6** | Each organizer signs in at `/auth/sign-in` and is added to `admin_users` ([admin-onboarding.md](../admin-onboarding.md)) |
| **O7** | Developer confirms `npm run prelaunch` passes |

Also walk through the manual admin workflow in the pre-launch checklist: verify payment, waitlist, team assignment, CSV export.

## Event week — backup exports

No automated exports in V1. From `/admin`:

| When | Action |
|------|--------|
| **Day before tournament** | Download **registrations CSV** and **teams CSV**; save securely offline |
| **Morning of tournament** | If anything changed overnight, download both CSVs again |
| **After final team lock** | Keep the teams CSV as the check-in roster |

## After the tournament — shutdown

Follow [post-event-checklist.md](./post-event-checklist.md):

| Item | Summary |
|------|---------|
| **P1–P2** | Export final registrations and teams CSVs for records |
| **P3–P4** | Decide whether to keep or delete Venmo payment screenshots in Vercel Blob |
| **P5** | Disable registration (`registration_enabled = false` for `2026-rusty-wedge`) |
| **P6** | Optional: show “registration closed” on the public site |
| **P7** | Document what payment proofs were kept or deleted and when |

## Admin URLs

| URL | Purpose |
|-----|---------|
| `/` | Public registration and waitlist |
| `/auth/sign-in` | Organizer sign-in |
| `/admin` | Dashboard, registrations, teams, waitlist, exports |

## Support

- Technical issues: contact the developer who deployed the site
- Registration disputes: use admin notes and payment proof review in `/admin`
- V1 has **no automated email/SMS** — organizers contact players manually

## Optional performance check

Before launch, run Chrome DevTools **Lighthouse** on `/` for a quick performance/accessibility spot-check. Findings are informational only — not a deploy blocker.
