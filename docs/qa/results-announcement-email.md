# Results Announcement Email — Operator Guide

One-time admin email blast to **confirmed registrations only**, after results are published. Admin UI lives on **`/admin/teams`** under **Public visibility**.

**Not included:** campaign builder, scheduling, newsletters, per-recipient delivery logs, or automatic send on publish.

---

## Environment variables

Server-only — never expose to the client.

| Variable | Example | Purpose |
|----------|---------|---------|
| `RESEND_API_KEY` | `re_…` | Resend API secret |
| `RESEND_FROM` | `Rusty Wedge <results@send.example.com>` | Verified sender identity for this environment |
| `APP_BASE_URL` | `https://your-dev-or-prod-host.example` | Absolute base for the Results link (`{APP_BASE_URL}/teams`) |

All three must be set before the send action runs. If any are missing, the admin panel shows **Not configured** and blocks send.

Add to Vercel → **Settings** → **Environment Variables** per environment (Development / Preview / Production). See [env-setup.md](../env-setup.md).

---

## Sender domain verification (Resend)

1. In the [Resend dashboard](https://resend.com/domains), add and verify the sending domain for the target year/environment.
2. Set `RESEND_FROM` to an address on that verified domain (e.g. `Rusty Wedge <results@send.rustywedge-2026.example>`).
3. Swapping domains in a future year is an **env-only** change — no template rewrite required.

Use a **separate test domain** or Resend test mode for development; do not use production participant inboxes in dev.

---

## Database migration (operator)

Migration `0006_lucky_agent_zero.sql` adds `results_announcement_status`, `results_announcement_sent_at`, and `results_announcement_sent_by_admin_id` on `tournaments`.

- Apply to **development** first; confirm admin panel and tests.
- Apply to **production** only via [prod-migration-plan.md](./prod-migration-plan.md) — separate explicit operator action.
- Default status for existing tournaments: `not_sent`.

---

## Development / test send procedure

**Use internal or test recipient addresses only. Never send to the real participant list from development.**

### Prerequisites

- Development `DATABASE_URL` with `DATABASE_TARGET=development`
- Migration `0006` applied on the development branch
- `RESEND_API_KEY`, `RESEND_FROM`, `APP_BASE_URL` set for local or preview
- Resend test domain verified; test inboxes available (e.g. `delivered@resend.dev` or team-owned test addresses)

### Steps

1. Start the app against the development database (`npm run dev`).
2. Sign in as an allowlisted admin and open **`/admin/teams`** (active, writable tournament).
3. Under **Public visibility**, **Publish results** if not already published.
4. Confirm **Results announcement email** shows:
   - Confirmed recipient count (matches confirmed registrations only)
   - Status badge appropriate to current `results_announcement_status`
5. For a first send (`not_sent`):
   - Check the acknowledgement checkbox
   - Click **Send results announcement**
   - Expect status → **Sent** (or **Partial** / **Outcome uncertain** if provider reports those outcomes)
6. Open the email in a test inbox:
   - Subject: `{tournament name} — Results Are Live`
   - **View Results** link resolves to `{APP_BASE_URL}/teams` with public results visible when `resultsPublished` is true
7. Confirm terminal states disable resend:
   - **Sent** and **Partially sent** — no send button
   - **Outcome uncertain** — only **Verify send status** (no generic retry)
8. To exercise recovery (optional, test env only):
   - With status `ambiguous` or stuck `sending`, use **Verify send status**
   - Same idempotency key is reused server-side; no duplicate blast to already-delivered recipients

### Reset for repeated dev testing

Reset announcement state on a **disposable or development-only tournament** (not production):

```sql
UPDATE tournaments
SET results_announcement_status = 'not_sent',
    results_announcement_sent_at = NULL,
    results_announcement_sent_by_admin_id = NULL
WHERE id = '<development-tournament-id>';
```

### Smoke test after config or template changes (development only)

Use this when a prior real send attempt consumed the production idempotency key (`results-announcement:{tournamentId}`) and Resend returns **409 invalid_idempotent_request** because the payload changed (for example `RESEND_FROM`, recipient count, or template content).

**Requirements:**

- `DATABASE_TARGET=development`
- `RESEND_*` and `APP_BASE_URL` configured
- `RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT` set to one controlled test inbox (not a participant address)
- Results published on the active tournament

**Steps:**

1. Add to `.env.local`:
   ```bash
   RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT="delivered@resend.dev"
   ```
   Use your own verified test inbox if not using Resend's test address.
2. Restart the dev server so env changes load.
3. Open **`/admin/teams`** → **Public visibility**.
4. Confirm **Results announcement smoke test** appears below the main announcement panel.
5. Check the acknowledgement box → **Send smoke test**.
6. Verify the email in the configured test inbox. Announcement status and audit events on the tournament remain unchanged.

Each smoke send uses a separate Resend idempotency key: `results-announcement-smoke:{tournamentId}:{suffix}`. The suffix defaults to a unique timestamp. To repeat the **same** payload within 24 hours, set `RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX` to a new value before each send.

**Do not** use smoke test for the real participant blast. Use **Send results announcement** once, with explicit production authorization.

---

## Production operator checklist

Complete **before** the first real blast:

- [ ] Migration `0006` applied on production ([prod-migration-plan.md](./prod-migration-plan.md))
- [ ] Production sending domain verified in Resend
- [ ] `RESEND_API_KEY`, `RESEND_FROM`, `APP_BASE_URL` set in Vercel **Production** env
- [ ] `APP_BASE_URL` matches the live public site origin (no trailing slash)
- [ ] Results published on the active tournament
- [ ] Admin recipient count reviewed on `/admin/teams`
- [ ] Acknowledgement checkbox read and understood (one-time, irreversible for delivered recipients)
- [ ] **Separate explicit authorization** to execute the production send — not implied by deploy or migration alone

**After send:**

- [ ] Status shows **Sent** (or **Partially sent** — manual follow-up for undelivered participants; no in-app full resend)
- [ ] Audit events present: `results_announcement_sent`, `results_announcement_partial`, `results_announcement_failed`, or `results_announcement_ambiguous` as applicable
- [ ] Do **not** re-run send for `partial` or `ambiguous` except **Verify send status** for uncertain outcomes

---

## Send-state reference (admin UI)

| DB status | Admin UI | Send again? |
|-----------|----------|-------------|
| `not_sent` | Send form + confirmation | Yes (after checkbox) |
| `sending` | In progress + Verify | No — verify only |
| `sent` | Sent on {date} | **No** |
| `partial` | X of Y delivered | **No** |
| `ambiguous` | Outcome uncertain + Verify | **No** — verify only |

---

## Security / privacy

- Recipient emails are never logged (see `scripts/security-review.mjs`).
- Audit metadata stores aggregate counts and provider batch ids only.

---

## Related docs

- [env-setup.md](../env-setup.md) — variable reference
- [deployment.md](./deployment.md) — production deploy flow
- Authoritative implementation plan: `.cursor/plans/results_announcement_email_59210a71.plan.md`
