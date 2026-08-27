# STOP Gate B — team_number constraints (Phase C)

**Scope:** Per-environment verification after migration `0003_teams_phase_c`.  
**Dev Gate B** success is required before implementing Slices 6–12 locally.  
**Prod Gate B** is independent — see public teams plan §19.

---

## Phase C migration (`0003_teams_phase_c`)

1. `ALTER TABLE teams ALTER COLUMN team_number SET NOT NULL`
2. `CREATE UNIQUE INDEX teams_tournament_number_unique ON teams (tournament_id, team_number)`

Drizzle schema: `lib/db/schema/teams.ts` — `teamNumber` `.notNull()` + unique on `(tournamentId, teamNumber)`.

---

## Preconditions (fail closed)

Before applying Phase C on an environment:

```bash
npm run db:verify-target
npm run db:team-number-precheck   # must exit 0
```

Reject migration if any `NULL` or duplicate `team_number` rows exist.

---

## Gate B verification

```bash
npm run db:team-number-gate-b
```

Checks:

| Check | Expected |
|-------|----------|
| `team_number` column | `is_nullable = NO` |
| Index | `teams_tournament_number_unique` present |
| Applied migrations | ≥ 4 (includes `0003_teams_phase_c`) |
| NULL `team_number` rows | 0 |
| Orphaned `team_members` | 0 |
| Unique smoke | Duplicate `(tournament_id, team_number)` insert rejected (rolled back) |
| Registrations / members | Counts reported for integrity review |

---

## Dev Gate B — approval record

| Field | Value |
|-------|-------|
| Date | 2026-08-27 |
| Hostname | `ep-steep-block-a6k4v8b2.us-west-2.aws.neon.tech` |
| Precheck before migrate | exit **0** (`nullTeamNumber: 0`) |
| Migrate `0003_teams_phase_c` | **success** |
| Gate B verify (`db:team-number-gate-b`) | exit **0** |
| Registrations | **972** |
| Team members | **0** (orphaned: **0**) |
| `team_number` nullable | **NO** |
| Unique index | `teams_tournament_number_unique` present |

**Dev Gate B passed.** Prod Gate B remains independent.

**OPERATOR APPROVED (2026-08-27)** — see [`gate-b-approval.md`](gate-b-approval.md).

---

## Operator decisions

- **Prod Phase C:** Independent precheck → migrate → Gate B on production branch (not dev cleanup).
- **Slice 6 required** before admin team create supports multiple teams per tournament (`createTeam` uses interim `teamNumber: 1` until allocation lands).
- **Test hygiene (deferred):** Integration-test team leakage/isolation — do not expand during Slice 5.

---

## Related

- Gate A approval: [`gate-a-approval.md`](gate-a-approval.md)
- Gate A cleanup workflow: [`gate-a-dev-cleanup.md`](gate-a-dev-cleanup.md)
- Plan: [`public_teams_feature_bd06e28b.plan.md`](../../.cursor/plans/public_teams_feature_bd06e28b.plan.md)
