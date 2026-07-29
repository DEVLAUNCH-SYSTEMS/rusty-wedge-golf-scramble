# Post-Event Checklist

Run after the tournament concludes. Event-week exports are listed first for reference during the tournament.

Organizers perform shutdown and archive steps in the admin UI at **`/admin/tournaments`**. No database SQL is required for lifecycle changes.

## Event-day backup (before and during tournament week)

From `/admin`, download and store CSVs securely offline:

- [ ] **O5** Day before: export registrations + teams CSV
- [ ] **O6** Morning of: re-export if changes occurred overnight
- [ ] After final team lock: keep teams CSV as the check-in roster

Use the **Tournament view** selector in the admin header if you need exports for a specific year. CSV links on the dashboard export the currently selected tournament.

See [launch-handoff.md](./launch-handoff.md) for organizer context.

## Archive exports

- [ ] **P1** Export final registrations CSV
- [ ] **P2** Export final teams CSV

Before archiving, confirm the admin header **Tournament view** shows the correct year, then export from `/admin` (dashboard CSV section or list pages).

## Payment proof retention

- [ ] **P3** Organizers decide: retain or delete Venmo payment screenshots
- [ ] **P4** If deleting: remove blobs from Vercel Blob and clear `payment_proof_path` on registrations (developer-assisted if needed)
- [ ] **P7** Document what was kept/deleted and when

See [blob-setup.md](../blob-setup.md) for blob deletion notes.

## Shutdown (admin lifecycle UI)

All steps below use **`/admin/tournaments`**. Each action shows a short description and requires confirmation (checkbox and/or typing the tournament year) before it runs.

Lifecycle order after the event:

```text
registration_open → registration_closed → completed → archived
```

### P5 — Close public registration

When you are ready to stop new sign-ups on the public site:

1. Sign in at `/auth/sign-in`
2. Open **`/admin/tournaments`**
3. Find the current year's tournament in the list
4. Click **Close registration**
5. Check the acknowledgment box and submit

**Result:** The public site (`/`) no longer accepts new registrations or waitlist entries for that tournament. Existing admin data is unchanged.

If registration was already closed, skip this step.

### P5b — Mark event completed

After tournament day (rosters finalized, no further admin edits expected on active workflows):

1. On **`/admin/tournaments`**, find the same tournament
2. Click **Mark completed**
3. Confirm with the acknowledgment checkbox

**Result:** Lifecycle moves to `completed`. Use this before archiving when the event is truly finished.

### P5c — Archive tournament (read-only history)

When final exports (P1–P2) are saved offline and you want this year frozen in admin:

1. On **`/admin/tournaments`**, find the tournament (must be in `completed` status)
2. Click **Archive tournament**
3. Type the tournament **year** in the confirmation field and submit

**Result:**

- Tournament lifecycle becomes `archived`
- Admin shows **View and export only** for that year (no edits, verify/reject, team changes, or manual adds)
- **No player or team data is deleted** — archive is status-only

To review an archived year later: use **Tournament view** in the admin header, select that year, and export or browse lists read-only.

### P6 — Public site after shutdown

- The public homepage always reflects the **active** tournament (**Make current** on `/admin/tournaments`), not whichever year you have selected for admin viewing
- With registration **closed**, **completed**, or **archived**, the public site does not open new registration
- Optional: replace landing copy with “registration closed” or take the site offline — that remains a deploy/content choice outside lifecycle buttons

## Restore from archive (if needed)

If a tournament was archived by mistake or you need temporary admin edits on a past year:

1. Open **`/admin/tournaments`**
2. Find the archived tournament
3. Click **Restore from archive**
4. Confirm with the acknowledgment checkbox

**Result:** Lifecycle returns to `completed` (not `registration_open`). Admin mutations are allowed again for that year. Re-archive when finished.

To reopen public registration for that year, use **Reopen registration** only if business rules allow (only one tournament may be `registration_open` at a time).

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Organizer | | | P1–P7 complete; lifecycle archived via admin UI |
