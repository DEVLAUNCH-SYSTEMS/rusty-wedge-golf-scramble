# Slice 8 — Teams publication backend

**Status:** OPERATOR APPROVED (2026-08-27)  
**Environment:** Development only  
**Prerequisite:** Slice 7 OPERATOR APPROVED — see [`slice-7-approval.md`](slice-7-approval.md)

---

## Operator decisions (locked)

- **`teamsPublished` is tournament-scoped** on `tournaments`; defaults `false`.
- **Admin-only** publish/hide mutations; server-side authorization via `requireAdminSession` + `requireAdminTournamentContext`.
- **Do not trust caller-supplied tournament identity** — tournament resolved from authoritative admin context.
- **Lifecycle:** publish/hide allowed for all non-archived states (including `completed`); blocked when `archived` (`TOURNAMENT_ARCHIVED`).
- **Audit:** `teams_published` / `teams_unpublished` events with `{ teamsPublished: boolean }` metadata.
- **Revalidation:** `/admin/teams` and `/teams` on toggle.

---

## Validation (dev)

**Result:** PASS (2026-08-27)

---

## Authorization

Proceed to **Slice 9** (publication UI on `/admin/teams`). Production untouched.
