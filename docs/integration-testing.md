# Integration test data lifecycle audit

**Date:** 2026-08-27  
**Scope:** DB-backed Vitest integration project (`tests/integration/**`)

---

## Root causes

### Persistent fixture leakage

| Root cause | Effect |
|------------|--------|
| No global cleanup hook | Teams, registrations, admins, waitlist rows persisted after `it()` blocks |
| `createTeam()` against active tournament | Every team test allocated `team_number` on shared seed tournament |
| `createTestAdminSession()` without teardown | `test-admin-*` rows accumulated |
| `insertRegistrationRow()` / `uniqueTestEmail()` without teardown | `@example.com` registrations accumulated |
| Inline disposable tournaments without shared delete order | Some suites deleted teams/tournaments; others left subgraphs |
| Audit `registration_events` retained | Events referenced deleted teams/admins |
| Local `afterEach` inconsistent | Some files cleaned isolated tournaments; active-tournament mutations did not |

### Production-target execution

| Root cause | Effect |
|------------|--------|
| `tests/integration/load-env.ts` set `RUN_CI_GATE=1` | `CI_GATE_DATABASE_URL` overrides `DATABASE_URL` when unset |
| `applyCiGateDatabaseEnv(true)` in `scripts/with-ci-gate-env.mjs` | CI gate scripts force CI URL |
| No explicit target guard in integration setup | If `CI_GATE_DATABASE_URL` overrode `DATABASE_URL` to a non-development host, mutating tests could run against the wrong database |
| Guard only on migration/fixture scripts | Integration Vitest entry point was unprotected |

---

## Suite inventory (31 files)

| Suite | Creates | Active tournament? | Prior cleanup | Migration |
|-------|---------|-------------------|---------------|-----------|
| `audit.integration.test.ts` | admin, team, audit event | Yes (via `createTeam`) | None | Registry + global cleanup |
| `teams.integration.test.ts` | admin, team, registrations | Yes | None | Registry + snapshot |
| `team-create-concurrency.integration.test.ts` | admin, 6 teams | Isolated disposable active tournament | Registry + disposable helper |
| `team-delete.integration.test.ts` | admin, teams, registrations, disposable tournament | Mixed | Partial | Registry + disposable helper |
| `registration-profile-update.integration.test.ts` | admin, registrations, waitlist, team | Yes | Partial (archived restore) | Registry + snapshot |
| `waitlist.integration.test.ts` | admin, waitlist, registration | Yes | None | Registry + snapshot |
| `public-teams-list.integration.test.ts` | disposable tournament, admin, team | Mixed | Local afterEach | Disposable helper + registry |
| `admin-teams-sort.integration.test.ts` | disposable tournament, admin, team | Mixed | Local afterEach | Disposable helper + registry |
| `teams-publication.integration.test.ts` | admin, disposable tournament | Mixed | Local afterEach | Existing local cleanup retained |
| `archived-tournament-readonly.integration.test.ts` | admin, registration, waitlist | Yes | Archived restore | Registry + snapshot |
| `capacity.integration.test.ts` | registrations | Yes | None | Registry + snapshot |
| `phase-a-schema.integration.test.ts` | registration (1 test) | Read + insert fail | N/A | Registry |
| `tournament-activate.integration.test.ts` | disposable tournaments | Swaps active | Local afterEach | Existing lifecycle cleanup |
| `tournament-lifecycle-*.integration.test.ts` | disposable tournaments, admins | Isolated | `deleteLifecycleTestTournament` | Shared delete helper |
| `multi-year-isolation.integration.test.ts` | disposable tournaments | Isolated | Local afterEach | Shared delete helper |
| `admin-manual-create*.integration.test.ts` | admin, registrations | Disposable / active | Partial | Registry via helpers |
| `registration.integration.test.ts` | registrations | Active | None | Registry via helpers |
| `waitlist-admin-create.integration.test.ts` | admin, waitlist | Active | None | Registry via helpers |
| Others | Mostly isolated tournaments | Varies | Varies | Helpers / existing cleanup |

---

## Suites still requiring active tournament

| Suite | Reason |
|-------|--------|
| `teams.integration.test.ts` | `assignPlayerToTeam` / `createTeam` use `requireActiveTournament()` |
| `team-create-concurrency.integration.test.ts` | Concurrent allocation on isolated writable tournament |
| `team-delete.integration.test.ts` | Delete service scopes to active tournament (except explicit scope test) |
| `registration-profile-update.integration.test.ts` | Profile update scoped to active tournament |
| `waitlist.integration.test.ts` | Waitlist promotion on active tournament |
| `public-teams-list.integration.test.ts` (1 test) | Published roster on active tournament |
| `admin-teams-sort.integration.test.ts` (1 test) | Admin list default context is active tournament |
| `archived-tournament-readonly.integration.test.ts` | Archives **active** tournament to assert guards |
| `capacity.integration.test.ts` | Confirmed capacity on active registration pool |
| `phase-a-schema.integration.test.ts` | Asserts seed active tournament lifecycle state |
| Lifecycle / activation suites | Explicitly test active-flag behavior |

Active tournament tests call `snapshotActiveTournament()` so `teams_published`, `lifecycle_status`, etc. restore after each test.

---

## Protection architecture

- **`lib/db/integration-database-target.ts`** — requires `DATABASE_TARGET=development` and exact hostname match via `INTEGRATION_DATABASE_HOST`; validates every configured URL source and the resolved migration target before connecting.
- **`tests/integration/load-env.ts`** — `beforeAll` guard (fail closed); prints verified hostname; global `afterEach` cleanup + leak scan.
- **`tests/integration/fixture-registry.ts`** — tracks IDs owned by each test file via helpers.
- **`lib/services/integration-fixture-cleanup.ts`** — FK-safe deletion by tracked IDs.
- **`lib/services/integration-fixture-leak-scan.ts`** — post-test leak detection (`@example.com`, `test-admin-*`, years 2080–2099, fixture catalog team names).

No bypass flag. Production is never a valid integration target.
