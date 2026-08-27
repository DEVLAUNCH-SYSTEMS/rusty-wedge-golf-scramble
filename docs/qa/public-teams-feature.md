# Public Teams Feature — Reference

**Feature status:** Development complete (Slices 1–12); **production Gate A precheck complete** — deploy blocked  
**Plan:** `.cursor/plans/public_teams_feature_bd06e28b.plan.md`  
**Environment evidence:** Dev gates approved; production Phase A + precheck recorded separately

---

## Purpose

Organizers manage tournament teams in admin and optionally **publish** rosters to a public `/teams` page. Public visitors see **Team #N** identity and **first/last names only** for confirmed players assigned to each team.

---

## Authoritative team identity

| Field | Role |
|-------|------|
| `teams.team_number` | **Authoritative** numeric identity (per tournament) |
| `Team #N` | Admin + public display label (`formatPublicTeamLabel`, `formatAdminTeamLabel`) |
| `teams.name` | Legacy composite label — **not** used as public identity |

Numeric ordering is always **numeric ASC** (1, 2, 10 — never lexicographic 1, 10, 2).

---

## Automatic team-number allocation

- On **Create team**, the next available `team_number` is allocated inside a transaction.
- Uniqueness is **tournament-scoped** (`teams_tournament_number_unique`).
- Concurrent creates retry on unique violation (`team-create-concurrency.integration.test.ts`).
- **Requires Phase C (Gate B):** `team_number NOT NULL` + unique index before allocation code runs on an environment.

---

## Admin team list

- URL: `/admin/teams`
- Sort: `?sort=asc` (default) or `?sort=desc` — numeric by `team_number`
- Each row: **Team #N** + assigned player names (**First Last**) from `team_members` → `registrations`
- Create / delete / assign flows unchanged from prior admin teams work

---

## Structured roster source

Public and admin roster previews read **assignments**, not legacy name strings:

`teams` → `team_members` → `registrations` (confirmed only on public surface)

Public DTO (`PublicTeamView`):

```typescript
{ teamNumber: number; players: { firstName: string; lastName: string }[] }
```

No IDs, email, phone, skill, payment, or admin metadata in the DTO.

---

## Four-player public presentation

Each public card reserves **exactly four** roster rows (`PUBLIC_TEAM_ROSTER_SLOT_COUNT`):

- Filled slots: **First Last**
- Open slots: em dash (`—`) placeholder
- Header shows **Team #N** and player count

Responsive grid: 3 → 2 → 1 columns (approved Slice 11 presentation).

---

## Publication / hide workflow

- Tournament flag: `tournaments.teams_published`
- Admin panel on `/admin/teams`: publish / hide with **confirmation checkbox**
- **Archived** tournaments: read-only — no publish/hide/create/delete mutations
- Publication is **tournament-scoped** (active public tournament only on `/` and `/teams`)

Audit events: `teams_published`, `teams_unpublished`.

---

## Public privacy contract

**Exposed on `/teams` when published:**

- Team number
- Player first name
- Player last name

**Never exposed publicly:**

- Registration IDs, team IDs, email, phone, skill
- Payment status / proof paths / notes
- Admin metadata, audit records
- Legacy `teams.name` as identity
- Capacity counts (existing H3 guard)

When **unpublished**, `/teams` shows *"Teams have not been published yet."* and **does not query roster data**.

Nav: **Teams** link hidden when unpublished; direct `/teams` still server-gated.

---

## Revalidation behavior

After mutations, Next.js paths revalidate:

| Action | Paths |
|--------|-------|
| Publish / hide | `/`, `/teams` |
| Create/delete team, assign/remove player | `/teams` **only if** currently published |

Nav visibility updates via SSR on next request (no client-owned publication state).

---

## Delete semantics

- **Empty team:** row deleted
- **Populated team:** `team_members` removed; **registrations preserved** (unassigned)
- Confirmation checkbox required
- Audit: `team_deleted` with team label and member count metadata

Dev fixture cleanup: `npm run db:fixture-team-cleanup` (dev-guarded) — see [`gate-a-dev-cleanup.md`](gate-a-dev-cleanup.md).

---

## Migration and gate requirements

### Development (completed)

| Gate | Status | Evidence |
|------|--------|----------|
| **Gate A** | OPERATOR APPROVED | [`gate-a-approval.md`](gate-a-approval.md) |
| **Phase C (dev)** | Applied | `0003_teams_phase_c` |
| **Gate B (dev)** | OPERATOR APPROVED | [`gate-b-approval.md`](gate-b-approval.md) |

### Production (Gate A precheck — operator cleanup pending)

**Do not treat dev evidence as production evidence.**

| Step | Status | Evidence |
|------|--------|----------|
| Target verification + Phase A | **Done** | [`gate-a-production-precheck.md`](gate-a-production-precheck.md) |
| Production precheck | **Exit 1** — 7 NULL blockers | same |
| Operator duplicate cleanup | **Pending** | 4 empty + 3 populated rows |
| Phase C on prod | **Not started** | — |
| Gate B on prod | **Not started** | — |
| Deploy | **Not started** | — |

1. **Operator cleanup** — remove 4 empty duplicate teams; assign #1, #4, #14 on canonical populated rows; re-run precheck → exit 0
2. **Operator review** — conflicts resolved on prod only (dev cleanup does not substitute)
3. **Phase C migration on prod** — `0003_teams_phase_c`
4. **Production Gate B** — `npm run db:team-number-gate-b` exit 0
5. **Deploy** application with allocation + public-teams code **after** prod Phase C
6. **Production smoke/regression** — publish, `/teams`, privacy scan, delete smoke
7. **Organizer acceptance** on production — see [`organizer-acceptance-checklist.md`](organizer-acceptance-checklist.md) section G
8. **STOP Gate C** — operator sign-off before calling feature live

---

## Validation commands

```bash
npm run lint && npm run typecheck
npm run test:unit
npm run test:integration   # feature suites
npm run test:public-privacy
npm run test:architecture
npm run build
npm run db:team-number-precheck   # after DB-mutating tests
npm run check                     # lint + typecheck + all vitest projects
```

E2E (optional, requires creds): `npm run test:e2e`

---

## Slice QA records

| Slice | Doc |
|-------|-----|
| 6 | [`slice-6-approval.md`](slice-6-approval.md) |
| 7 | [`slice-7-approval.md`](slice-7-approval.md) |
| 8 | [`slice-8-approval.md`](slice-8-approval.md) |
| 9 | [`slice-9-approval.md`](slice-9-approval.md) |
| 10 | [`slice-10-approval.md`](slice-10-approval.md) |
| 11 | [`slice-11-approval.md`](slice-11-approval.md) |
| 12 | [`slice-12-approval.md`](slice-12-approval.md) |

---

## Deferred (out of scope)

- Integration-test DB isolation / fixture leakage — separate DevLaunch engineering task
- Production Phase C / Gate B / deploy — requires precheck exit 0 + explicit operator approval per step
