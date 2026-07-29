# Admin Authorization and Audit Review (F3)

Checkpoint review against plan §10. Completed as part of Phase F hardening.

## Authorization summary

| Boundary | Enforcement |
|----------|-------------|
| Admin session | `requireAdminSession()` on every server action and admin API route |
| Active tournament mutations | `requireActiveTournament()` + `assertTournamentScope()` |
| Writable tournament | `assertTournamentWritable()` / `requireWritableActiveTournament()` blocks archived |
| Admin reads (lists, CSV, proofs) | `requireAdminTournamentContext()` or explicit `tournamentId` param |
| Payment proof download | Admin session + registration scoped to selected tournament context |
| Public routes | Unchanged — no admin bypass |

## Mutation checklist

| Mutation | Action / route | Session | Scope / lifecycle guard | Audit event |
|----------|----------------|---------|-------------------------|-------------|
| Verify payment | `verifyRegistrationPaymentAction` | Yes | Active + writable + scoped | `payment_verified` or `verify_blocked_capacity` |
| Reject payment | `rejectRegistrationPaymentAction` | Yes | Active + writable + scoped | `payment_rejected` |
| Cancel registration | `cancelRegistrationAction` | Yes | Active + writable + scoped | `registration_cancelled` |
| Update notes | `updateRegistrationNotesAction` | Yes | Active + writable + scoped | `admin_notes_updated` |
| Edit profile | `updateRegistrationProfileAction` | Yes | Active + writable + scoped; pending/confirmed only | `registration_profile_updated` |
| Manual registration | `createAdminRegistrationAction` | Yes | Writable active tournament | `registration_created_by_admin` |
| Manual waitlist | `createAdminWaitlistEntryAction` | Yes | Writable active tournament | `waitlist_created_by_admin` |
| Promote waitlist | `promoteWaitlistEntryAction` | Yes | Active + writable + scoped | `waitlist_promoted` |
| Remove waitlist | `removeWaitlistEntryAction` | Yes | Active + writable + scoped | — (see deferred) |
| Create team | `createTeamAction` | Yes | Writable active tournament | `team_created` |
| Assign player | `assignPlayerToTeamAction` | Yes | Active + writable + team/registration scoped | `player_assigned_to_team` |
| Remove from team | `removePlayerFromTeamAction` | Yes | Active + writable + scoped | `player_removed_from_team` |
| Create tournament | `createTournamentAction` | Yes | Slug/year uniqueness; draft default | `tournament_created` |
| Activate tournament | `activateTournamentAction` | Yes | Writable target; confirmation required | `tournament_activated` |
| Lifecycle transition | `transitionTournamentLifecycleAction` | Yes | Allowed edge + confirmation rules | `tournament_lifecycle_changed` |
| Set admin view | `setAdminTournamentContextAction` | Yes | Tournament must exist | — (read preference only) |
| Export registrations CSV | `GET /api/admin/export/registrations` | Yes | Tournament context / `?tournamentId=` | — (read) |
| Export teams CSV | `GET /api/admin/export/teams` | Yes | Tournament context / `?tournamentId=` | — (read) |
| Payment proof file | `GET /api/admin/payment-proofs/[id]` | Yes | Scoped to admin tournament context | — (read) |

## Audit types (plan §10)

All required event types exist in `lib/services/audit-types.ts`:

- `registration_profile_updated`
- `registration_created_by_admin`
- `waitlist_created_by_admin`
- `tournament_created`
- `tournament_lifecycle_changed`
- `tournament_activated`

Legacy events retained: `payment_verified`, `payment_rejected`, `registration_cancelled`, `waitlist_promoted`, `team_created`, `player_assigned_to_team`, `player_removed_from_team`, `admin_notes_updated`, `verify_blocked_capacity`.

## Fixes applied in F3

1. **Audit gaps closed** — manual registration, manual waitlist, and tournament create now record §10 audit events.
2. **Profile edit guard** — service rejects edits when registration status is not `pending_review` or `confirmed` (previously UI-only).

## Deferred (documented, not blocking)

| Item | Rationale |
|------|-----------|
| `waitlist_removed` audit | Not in plan §10; remove is low-volume and status change is recoverable from DB |
| RBAC beyond allowlist | Plan §10 default: single admin role for v1 |
| Audit on tournament view cookie change | Read preference only, not business mutation |
| Audit on CSV export | Read operation; access already gated by session |

## Sign-off

- [x] Every write path uses `requireAdminSession`
- [x] Player/team/waitlist writes scoped to active writable tournament
- [x] Plan §10 audit types implemented and wired
- [x] High-impact confirms: archive (type year), make current, lifecycle acknowledge
