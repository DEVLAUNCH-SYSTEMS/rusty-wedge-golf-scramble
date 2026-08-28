# STOP Gate A — Dev fixture cleanup (development only)

**Status:** OPERATOR APPROVED — see [`gate-a-approval.md`](gate-a-approval.md).

**Scope:** Neon **dev** branch only (`.env.local` → `<development-db-host>`).  
**Slice 5 Phase C on dev** was authorized after Gate A approval.

**Completion criterion:**

```bash
npm run db:team-number-precheck
```

→ exit **0**  
→ **0** rows with `NULL team_number`

---

## Slice 7 — admin sort + roster preview

**Status:** IMPLEMENTED — see [`slice-7-approval.md`](slice-7-approval.md).

On `/admin/teams`, **Team #N** (`team_number`) is the authoritative primary identity. Default list order is numeric ASC with explicit ASC/DESC toggle. Assigned player names render as muted secondary text under the title from `team_members` → `registrations` (not from `teams.name`).

---

## Current dev baseline (precheck)

Run before Gate A work to confirm target and blockers:

```bash
npm run db:team-number-precheck
```

Expect **failure** until cleanup completes. Recent dev snapshot:

| Metric | Value |
|--------|------:|
| Host | `<development-db-host>` |
| Total teams | 159 |
| `NULL team_number` | 159 (all blockers) |
| Recognized fixture artifacts | 144 |
| Non-fixture `NULL` teams | ~15 (leaked test names — see below) |

Fixture patterns (Slice 2 catalog — **only** these may be bulk-deleted):

| patternId | Label | Evidence |
|-----------|-------|----------|
| `audit-team` | Audit Team | `tests/integration/audit.integration.test.ts` |
| `integration-team-a` | Integration Team A | `tests/integration/teams.integration.test.ts` |
| `integration-team-b` | Integration Team B | `tests/integration/teams.integration.test.ts` |
| `archived-guard-team` | Archived Guard Team | `tests/integration/archived-tournament-readonly.integration.test.ts` (usually not persisted) |
| `h-edit-team-uuid` | H-edit team `{uuid}` | `tests/integration/registration-profile-update.integration.test.ts` |

Source of truth: `lib/db/team-number-fixture-patterns.ts` (`classifyFixtureTeamName`).

---

## Phase 1 — Representative UI deletion acceptance (operator)

Validate delete UX and server semantics on **dev** before any bulk script. Use the active tournament (`2026-rusty-wedge`) in `/admin/teams`.

### Scenarios

| # | Scenario | Where | Suggested target |
|---|----------|-------|------------------|
| 1 | Empty team delete | `/admin/teams` (desktop table) | Any **Integration Team A** or **Audit Team** (0/4) |
| 2 | Empty team delete | Team detail `/admin/teams/[id]` | Different empty fixture team |
| 3 | Populated fixture delete | Either surface | **Integration Team B** (has assigned players) |

For each scenario: expand delete → read consequence copy → check acknowledgement → submit.

### Evidence required (per scenario)

Record team id/name before delete, then verify:

| Requirement | How to verify |
|-------------|---------------|
| Empty team removed from list | Row/card gone after revalidation; direct URL returns not found |
| Populated copy shown | UI shows unassign + registrations preserved language |
| Registrations preserved | Assigned players still exist in admin registrations (same ids/emails) |
| Team membership removed | No `team_members` rows for deleted `team_id` |
| Audit event recorded | `registration_events.event_type = 'team_deleted'`, `team_id IS NULL`, metadata contains `teamName`, `memberCount`, `teamNumber` |
| Unrelated data unaffected | Other teams, registrations, and waitlist entries unchanged |

### Example SQL checks (dev)

Replace `:team_id` and `:team_name` with values from the UI run.

```sql
-- Team gone
SELECT id FROM teams WHERE id = :team_id;

-- Membership cleared
SELECT * FROM team_members WHERE team_id = :team_id;

-- Registrations still present (populated case — use known registration ids from team detail before delete)
SELECT id, email, registration_status FROM registrations WHERE id IN (:registration_ids);

-- Audit event
SELECT event_type, team_id, metadata, admin_user_id, created_at
FROM registration_events
WHERE event_type = 'team_deleted'
  AND metadata->>'teamName' = :team_name
ORDER BY created_at DESC
LIMIT 5;

-- Unrelated team count stable (compare before/after)
SELECT count(*) FROM teams WHERE tournament_id = (SELECT id FROM tournaments WHERE is_active = true);
```

### Phase 1 exit

Operator signs off: **UI delete path accepted** for empty (list + detail) and populated fixture cases, with evidence captured.

---

## Phase 2 — Dev fixture bulk cleanup (implemented)

```bash
# Dry run (default)
DATABASE_TARGET=development \
INTEGRATION_DATABASE_HOST=<development-db-host> \
FIXTURE_TEAM_CLEANUP_CONFIRM=confirm-dev-fixture-cleanup \
npm run db:fixture-team-cleanup

# Execute (development only)
DATABASE_TARGET=development \
INTEGRATION_DATABASE_HOST=<development-db-host> \
FIXTURE_TEAM_CLEANUP_CONFIRM=confirm-dev-fixture-cleanup \
npm run db:fixture-team-cleanup -- --execute
```

Implementation: `lib/db/fixture-team-cleanup.ts`, `lib/services/fixture-team-cleanup.ts`, `lib/db/dev-fixture-cleanup-guard.ts`.

**Phase 1 note:** Empty-team UI acceptance already completed by operator. One populated `Integration Team B` acceptance case should be retained from manual testing before bulk cleanup (not repeated here).

**2026-08-27 dev execute result:** 144 fixture teams deleted (first pass); 15 `Delete Test …` teams deleted (second pass); precheck exit **0**, `nullTeamNumber: 0`.

### Purpose

Remove the **144** repository-recognized fixture teams so Gate A can reach 0 `NULL team_number` without assigning numbers to test artifacts.

### Hard guards (fail closed)

1. **Explicit development target** — require `DATABASE_TARGET=development` and exact hostname match via `INTEGRATION_DATABASE_HOST` (same model as integration tests and `scripts/cleanup-test-players.mjs`). Reject pooler-only ambiguity; prefer unpooled URL for writes.
2. **Explicit confirmation env** — require  
   `FIXTURE_TEAM_CLEANUP_CONFIRM=confirm-dev-fixture-cleanup`
3. **Reject CI / prod contexts** — exit if `CI=true`, `RUN_CI_GATE=1`, or `CI_GATE_DATABASE_URL` would override local dev URL.
4. **Dry-run default** — no mutations unless `--execute` is passed.
5. **Pattern-only deletion** — candidate set = teams where `classifyFixtureTeamName(name) !== null`.  
   **Never** delete based on `member_count = 0` or 0/4 alone.
6. **Pre-flight report** — print counts per `patternId`, populated vs empty, and refuse if any candidate name falls outside the catalog matcher (unexpected).
7. **Reuse delete semantics** — each deletion uses the same transaction as `deleteTeam` (null audit FKs → insert `team_deleted` → delete team → cascade `team_members`). Dev script may call an internal helper that skips active-tournament UI scope so inactive-tournament fixture rows (e.g. stray scope-test rows) are included **only** when name matches catalog.
8. **Audit attribution** — use a real `admin_users.id` (e.g. operator session or documented dev admin), not silent bypass.

### Proposed command surface

```bash
# Read-only: list what would be deleted
npm run db:fixture-team-cleanup

# Mutating (after operator approval + confirm env)
DATABASE_TARGET=development \
INTEGRATION_DATABASE_HOST=<development-db-host> \
FIXTURE_TEAM_CLEANUP_CONFIRM=confirm-dev-fixture-cleanup \
npm run db:fixture-team-cleanup -- --execute
```

### Remaining non-fixture blockers (~15)

Bulk fixture cleanup will **not** remove leaked names such as `Delete Test … {uuid}` (`team-delete.integration.test.ts`) or orphan rows in inactive `delete-scope-*` tournaments unless they match the Slice 2 catalog.

After bulk execute, re-run precheck and **manually** delete or resolve any remaining `NULL team_number` rows reported in the “Unparseable team names” section.

---

## Phase 3 — Integration-test leakage discipline

Broad integration suites **recreate** fixture teams on the same dev database:

| Test file | Creates |
|-----------|---------|
| `audit.integration.test.ts` | Audit Team |
| `teams.integration.test.ts` | Integration Team A, Integration Team B |
| `registration-profile-update.integration.test.ts` | H-edit team `{uuid}` |
| `team-delete.integration.test.ts` | `Delete Test … {uuid}` (non-catalog) |

**Between bulk cleanup and final precheck:**

- **Do not run** `npm run test:integration`, `npm run ci:gate`, or other broad DB-mutating suites.
- **Safe:** `npm run lint`, `npm run typecheck`, `npm run test:unit`.

If integration tests run before precheck, expect fixture counts to jump back up and Gate A to fail again.

---

## Phase 4 — Gate A sign-off

1. Phase 1 UI acceptance complete.
2. Operator approves Phase 2 script (implementation PR).
3. Execute bulk cleanup once (Phase 2).
4. Resolve any remaining non-fixture `NULL` teams.
5. **Without** running broad integration tests, run:

```bash
npm run db:team-number-precheck
echo $?   # must be 0
```

6. Confirm summary shows `"nullTeamNumber": 0`.

Only then proceed toward Slice 5 / Phase C planning.

---

## STOP — operator actions now

1. **Run Phase 1** UI deletion acceptance on dev; capture evidence table above.
2. **Reply with approval** to implement Phase 2 bulk cleanup script (`db:fixture-team-cleanup`).
3. **Do not** execute bulk cleanup until that approval is explicit.

No production changes. No Slice 5. No Gate A bulk delete in this step.
