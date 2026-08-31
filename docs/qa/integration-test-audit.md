# Integration test suite audit (2026-08-27)

Canonical detail: [`integration-testing.md`](integration-testing.md)

## Summary

- **31** DB-backed integration test files under `tests/integration/`
- **Root leakage:** missing teardown for admins, `@example.com` registrations, teams on active tournament, waitlist rows, audit events
- **Root production exposure:** `RUN_CI_GATE=1` + unguarded Vitest setup allowed mutating tests when `CI_GATE_DATABASE_URL` resolved to production

## Remediation

1. Protected-database guard in `tests/integration/load-env.ts`
2. Global fixture registry + FK-safe cleanup
3. Post-test leak detection (fail; do not silent-clean)
4. Helper tracking on `createTestAdminSession`, `insertRegistrationRow`, `createIntegrationTeam`, `insertDisposableTournament`
5. `snapshotActiveTournament()` for active-tournament mutations

## Entry points audited

| Entry | Guard |
|-------|-------|
| `vitest` integration project | `tests/integration/load-env.ts` |
| `npm run test:integration` | Same setup file |
| `npm run ci:gate` → `RUN_CI_GATE=1 test:integration` | Same |
| `npm run check` | Unit + integration — integration guarded |
| `db:migrate` / fixture cleanup scripts | Existing migration/dev guards (unchanged) |

Production must never be a valid integration-test target.
