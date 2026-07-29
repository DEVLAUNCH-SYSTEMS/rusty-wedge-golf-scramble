# Admin Onboarding

Each tournament organizer uses their **own Neon Auth account**. Do not share admin credentials.

## Steps

1. Deploy the app with Neon Auth configured (`NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`).
2. Visit `/auth/sign-in` and create a Neon Auth account with your organizer email.
3. After sign-in, note your Neon Auth user ID from the Neon Auth dashboard or session payload.
4. Insert an allowlist row in `admin_users` (via SQL or Neon console):

```sql
INSERT INTO admin_users (neon_auth_user_id, email, display_name)
VALUES ('YOUR_NEON_AUTH_USER_ID', 'you@example.com', 'Your Name');
```

5. Sign out and sign in again, then open `/admin`.

## Adding another organizer

Repeat steps 2–4 for each person. Each organizer gets a separate Neon Auth account and allowlist row.

## Removing access

Delete the row from `admin_users` for that `neon_auth_user_id`. This immediately revokes admin access on the next request.

---

## Admin URLs

| URL | Purpose |
|-----|---------|
| `/admin` | Dashboard, CSV exports, capacity summary |
| `/admin/registrations` | Search and review registrations; link to add player |
| `/admin/registrations/new` | Manually add a registration or waitlist entry |
| `/admin/registrations/[id]` | Registration detail, payment proof, verify/reject, edit profile |
| `/admin/waitlist` | Promote or remove waitlist entries |
| `/admin/teams` | Create teams, assign players, export teams |
| `/admin/tournaments` | Lifecycle (open/close/complete/archive), **Make current** |
| `/admin/tournaments/new` | Create next year's tournament (draft) |

See [launch-handoff.md](./qa/launch-handoff.md) for event-week exports and [post-event-checklist.md](./qa/post-event-checklist.md) for shutdown and archive.

---

## Tournament view selector

The **Tournament view** dropdown in the admin header changes which year's data you see on dashboard, lists, and CSV exports. It does **not** change the public site.

- **Public active** — the tournament shown on `/` (**Make current** on `/admin/tournaments`)
- **View only** — you are browsing another year; mutations are disabled until you switch back to the active tournament

Archived years are always view/export only.

---

## Manual add player

Use **`/admin/registrations/new`** (or **Add player** on the registrations page) to create entries for the **active** tournament only.

1. Choose **Registration** or **Waitlist**
2. Fill in name, email, phone, skill level, optional preferred players and notes
3. For registrations, set payment status:
   - **Submitted (verify later)** — same as a public signup pending review
   - **Verified (confirm if capacity allows)** — confirms when capacity allows (same rules as admin verify)
4. Optionally attach a payment proof file (JPG, PNG, or PDF, max 5 MB)
5. Click **Save player**

Duplicate emails for the same tournament are blocked. Contact players offline if needed — V1 has no automated email.

---

## Edit player profile

On **`/admin/registrations/[id]`**, the **Edit player** card updates profile fields for registrations in **pending review** or **confirmed** status:

- First and last name
- Email and phone
- Best score ever (skill level)
- Preferred players (free text)
- Player notes

Edits are blocked when:

- The tournament is **archived**
- You are viewing a **non-active** year in the tournament selector (switch to the active tournament to edit)

Changing a name does not update `preferred_players` text on other registrations — that field is not linked across rows.

Payment status, team assignment, and verify/reject actions use separate controls on the same detail page.

---

## Read-only banners

| Message | Meaning |
|---------|---------|
| *This tournament is archived. View and export only.* | No mutations for that year |
| *You are viewing a non-active tournament…* | Lists/exports scoped to that year; switch to active to edit |

---

## Related docs

| Doc | Topic |
|-----|--------|
| [launch-handoff.md](./qa/launch-handoff.md) | Pre-launch sign-off, event-week exports, **next-year setup** |
| [post-event-checklist.md](./qa/post-event-checklist.md) | Archive, exports, **payment proof retention (P3–P4)** |
| [blob-setup.md](./blob-setup.md) | Vercel Blob setup and proof deletion (developers + P4) |
