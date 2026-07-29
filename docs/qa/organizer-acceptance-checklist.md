# Organizer Acceptance Checklist (Admin Player + Annual Reuse)

Manual sign-off for the **Admin Player Management and Annual Tournament Reuse** release. Complete after developer deploys to staging or production and before treating the release as live.

General launch items (O1–O7) remain in [prelaunch-checklist.md](./prelaunch-checklist.md). Post-event steps are in [post-event-checklist.md](./post-event-checklist.md).

---

## A. Player edit (Phase B)

Sign in at `/auth/sign-in`, confirm the **Tournament view** selector shows the current year, then:

- [ ] **A1** Open a `pending_review` registration → **Edit player** → change name or phone → save → detail page shows updated values
- [ ] **A2** Edit skill level and admin notes on a confirmed registration
- [ ] **A3** Confirm edit is **not** offered (or fails with a clear message) for cancelled registrations

---

## B. Manual add player (Phase C)

From `/admin/registrations/new`:

- [ ] **B1** Add a **registration** with payment status and optional payment proof → appears on registrations list as `pending_review`
- [ ] **B2** Add a **waitlist entry** → appears on `/admin/waitlist`
- [ ] **B3** Duplicate email for the same tournament is rejected with a clear error

---

## C. Tournament lifecycle (Phase D)

On `/admin/tournaments` for the **current year** (use a test/staging tournament if possible):

- [ ] **C1** **Close registration** — public site (`/`) stops accepting new sign-ups; acknowledgment required
- [ ] **C2** **Mark completed** — status badge updates; admin can still edit when not archived
- [ ] **C3** **Archive tournament** — requires typing the year; lists become read-only (no verify, edit, team assign, or manual add)
- [ ] **C4** **Restore from archive** — returns to `completed`; edits work again
- [ ] **C5** Archived year remains visible in **Tournament view** selector; CSV export still works read-only

---

## D. Next year setup (Phase E)

- [ ] **D1** **Create draft tournament** at `/admin/tournaments/new` with a new year and slug
- [ ] **D2** **Copy settings from** prior year — venue, fee, capacity, Venmo copy over; **no** players, teams, or waitlist copy
- [ ] **D3** **Open registration** on the new draft (only one `registration_open` at a time)
- [ ] **D4** **Make current** — public site (`/`) shows the new tournament
- [ ] **D5** **Tournament view** selector — switch to draft year → registrations list shows only that year’s data
- [ ] **D6** CSV export for draft year contains only that year’s rows (not the prior year)
- [ ] **D7** Switch selector back to prior/active year — data isolation confirmed

---

## E. Mobile and tablet admin (UI hardening)

On a phone (or narrow browser window):

- [ ] **E1** Admin nav, tournament selector, and list pages scroll without horizontal overflow
- [ ] **E2** Registrations, waitlist, teams, and tournaments lists are readable (card layout below ~1100px width)
- [ ] **E3** Create tournament and add-player forms are usable on mobile

---

## F. Security spot-check (organizer-visible)

- [ ] **F1** Signed out → `/admin` redirects to sign-in
- [ ] **F2** Public homepage shows **no** capacity counts or registration PII
- [ ] **F3** High-impact actions require confirmation (archive year typing, make current acknowledgment)

---

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Organizer | | | A1–F3 complete on staging/production |
| Developer | | | Assisted walkthrough; issues logged below |

### Issues found (if any)

| Item | Description | Severity | Follow-up |
|------|-------------|----------|-----------|
| | | | |

---

## Related docs

- [launch-handoff.md](./launch-handoff.md) — ongoing organizer runbook
- [admin-onboarding.md](../admin-onboarding.md) — URLs and workflows
- [release-readiness-report.md](./release-readiness-report.md) — developer release summary and open risks
