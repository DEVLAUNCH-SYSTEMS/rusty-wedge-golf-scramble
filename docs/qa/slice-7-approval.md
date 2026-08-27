# Slice 7 — Admin team list sort + roster preview

**Status:** OPERATOR APPROVED (2026-08-27)  
**Environment:** Development only  
**Prerequisite:** Slice 6 OPERATOR APPROVED — see [`slice-6-approval.md`](slice-6-approval.md)

---

## Operator decisions (locked)

- **`teamNumber` is authoritative team identity** — list ordering and primary label use numeric `team_number`, not `teams.name` or creation date.
- **Default sort:** numeric ASC (`1, 2, 3, … 10`, never lexicographic).
- **Explicit ASC / DESC control** via `/admin/teams?sort=asc|desc`.
- **Primary label:** `Team #N` (`formatAdminTeamLabel`).
- **Roster preview:** assigned player names from `team_members` → `registrations` join; muted secondary line under title; empty roster shows no secondary line.
- **Roster name format (post-approval):** display as **First Last** (presentation-only; structured source unchanged).
- **Preserve Delete Team** behavior and authorization unchanged.
- **Dev QA data:** six Slice 6 concurrency-test teams (`Team #1`–`#6`) remain in dev DB for manual ordering/roster QA — do not delete until operator clears.

---

## Implementation summary

| Area | Behavior |
|------|----------|
| Query / sort | `listTeamsForAdmin(sort)` → `ORDER BY teams.team_number ASC/DESC` scoped to admin tournament |
| Roster shape | `rosterMembers: { firstName, lastName }[]` loaded in `loadTeamRosterMembersByTeamId` |
| UI | `TeamListIdentity` (title + roster preview); `TeamsListSortToggle`; table + mobile cards share identity component |
| Tests | Unit: sort parse, roster format, label; integration: ASC/DESC numeric order, roster mapping, empty roster |

---

## Validation (dev)

**Result:** PASS (2026-08-27)

```bash
npm run lint && npm run typecheck
npm run test:unit -- tests/unit/admin-team-list-sort.test.ts tests/unit/team-roster-display.test.ts tests/unit/team-display.test.ts
npm run test:integration -- tests/integration/admin-teams-sort.integration.test.ts
```

---

## Authorization

Proceed to **Slice 8** (teams publication backend) on development. Production untouched.
