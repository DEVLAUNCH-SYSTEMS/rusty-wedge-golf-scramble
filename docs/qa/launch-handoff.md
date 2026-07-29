# Launch Handoff (Organizers)

One-page guide for tournament organizers before and after go-live. Developers complete technical deploy steps in [deployment.md](./deployment.md).

## Before launch — organizer sign-off

Complete every item in [prelaunch-checklist.md](./prelaunch-checklist.md):

| Item | What you do |
|------|-------------|
| **O1** | Confirm organizer contact info on the public site is approved |
| **O2** | Confirm the Venmo handle is correct (not the `@RustyWedge` placeholder) |
| **O3** | Register on an **iPhone** using a photo-library payment screenshot |
| **O4** | Register on an **Android** phone using a photo-library payment screenshot |
| **O5** | Register on **desktop** using JPG, PNG, or PDF from the file picker |
| **O6** | Each organizer signs in at `/auth/sign-in` and is added to `admin_users` ([admin-onboarding.md](../admin-onboarding.md)) |
| **O7** | Developer confirms `npm run prelaunch` passes |

Also walk through the manual admin workflow in the pre-launch checklist: verify payment, waitlist, team assignment, CSV export.

For this release, complete the feature-specific walkthrough in [organizer-acceptance-checklist.md](./organizer-acceptance-checklist.md) (edit player, manual add, lifecycle, next-year setup). Developer release summary: [release-readiness-report.md](./release-readiness-report.md).

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
| **P5** | Close registration via **`/admin/tournaments`** → **Close registration** (replaces manual SQL) |
| **P5b–P5c** | **Mark completed**, then **Archive tournament** when records are finalized |
| **P6** | Public site stops new registration when lifecycle is not open; optional landing-page copy is a separate deploy choice |
| **P7** | Document what payment proofs were kept or deleted and when |

Archived tournaments remain in the database for view/export only. Use **Restore from archive** on `/admin/tournaments` if you need to undo an archive (see post-event checklist).

## Next year — annual tournament setup

Run after the prior year is archived (or when you are ready to prepare the next event). Full admin workflow details are in [admin-onboarding.md](../admin-onboarding.md).

| Step | Action |
|------|--------|
| 1 | Open **`/admin/tournaments/new`** (or **Create tournament** on the tournaments page) |
| 2 | Optionally choose **Copy settings from** a prior year — copies venue, fees, capacity, tee time, and Venmo only (**never** registrations, teams, or waitlist) |
| 3 | Set the new **year**, **event date**, name, slug, and adjust copied fields as needed |
| 4 | Submit **Create draft tournament** — the new row starts in **draft** status |
| 5 | On **`/admin/tournaments`**, click **Open registration** when you are ready for public sign-ups (only **one** tournament may be `registration_open` at a time) |
| 6 | Click **Make current** so the public site (`/`) uses this tournament |
| 7 | Confirm Venmo handle and capacity on the create form match [prelaunch checklist](./prelaunch-checklist.md) items **O1–O2** before go-live |

**Order tip:** You can create a draft and copy settings before the old year is archived. Keep the prior year **archived** (or at least not `registration_open`) before opening registration on the new year.

Developers: initial bootstrap uses `npm run db:seed` once per environment — see [database-setup.md](../database-setup.md). Before applying migration `0001` to production, follow [prod-migration-plan.md](./prod-migration-plan.md) (dev verified; prod requires organizer approval).

## Manual player operations

| Task | Where |
|------|--------|
| Add registration or waitlist entry | `/admin/registrations/new` |
| Edit name, contact, skill, notes | Registration detail → **Edit player** |
| Verify/reject payment, cancel | Registration detail → action panel |
| Promote waitlist → pending review | `/admin/waitlist` |

Manual adds and edits apply to the **active** tournament only. Viewing another year in the header selector is read-only for mutations.

## Payment proof retention (P3–P4)

After the event, organizers decide whether to keep Venmo screenshots in Vercel Blob storage:

| Choice | Organizer action |
|--------|------------------|
| **Retain** | No change — proofs stay in Blob; admins can still view them on registration detail |
| **Delete** | Work with the developer to remove blobs and clear `payment_proof_path` (see [blob-setup.md](../blob-setup.md)) |
| **Document** | Record what was kept or deleted and when (**P7** in [post-event-checklist.md](./post-event-checklist.md)) |

Retention is a policy decision — the app does not auto-delete proofs on archive.

## Admin URLs

| URL | Purpose |
|-----|---------|
| `/` | Public registration and waitlist (active tournament only) |
| `/auth/sign-in` | Organizer sign-in |
| `/admin` | Dashboard, registrations, teams, waitlist, exports |
| `/admin/registrations/new` | Manually add registration or waitlist entry |
| `/admin/registrations/[id]` | Detail, payment proof, verify/reject, edit profile |
| `/admin/tournaments` | Lifecycle (close, complete, archive, restore) and **Make current** for the public site |
| `/admin/tournaments/new` | Create next year's draft tournament |

## Support

- Technical issues: contact the developer who deployed the site
- Registration disputes: use admin notes and payment proof review in `/admin`
- V1 has **no automated email/SMS** — organizers contact players manually

## Optional performance check

Before launch, run Chrome DevTools **Lighthouse** on `/` for a quick performance/accessibility spot-check. Findings are informational only — not a deploy blocker.
