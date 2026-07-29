# Database Setup

## Prerequisites

1. Create a Neon Postgres project and copy the connection string.
2. Copy environment variables locally:

```bash
cp .env.example .env.local
```

3. Set `DATABASE_URL` in `.env.local` (see [env-setup.md](./env-setup.md)).

## Apply schema

Run migrations against your Neon database:

```bash
npm run db:migrate
```

Uses the `pg` driver with explicit error logging (via `lib/db/migrate.ts`). Prefer `DATABASE_URL_UNPOOLED` or a direct Neon connection string for DDL.

This applies SQL from `drizzle/migrations/`, including partial unique indexes on active registration and waitlist emails.

## Seed active tournament

After migrations succeed:

```bash
npm run db:seed
```

Seeds one active tournament:

- Slug: `2026-rusty-wedge`
- Event: The Rusty Wedge Golf Scramble, August 28, 2026
- Location: Deer Park Golf Course
- Capacity: 68 confirmed players
- Venmo: `@scottyrusty`

The seed is idempotent; re-running updates the active tournament row when the slug already exists.

**Production note:** `db:seed` bootstraps the first tournament in a new environment. Each subsequent year is created by organizers in **`/admin/tournaments/new`** — not by re-running seed or manual SQL inserts.

## Multi-year tournaments (developers)

Migrations add `lifecycle_status` on `tournaments` (`draft`, `registration_open`, `registration_closed`, `completed`, `archived`) and a partial unique index enforcing **one** `is_active = true` row.

| Concern | Where it lives |
|---------|----------------|
| Create new year | Admin UI → `createTournamentAction` / copy-settings service |
| Public site tournament | `is_active = true` (**Make current** in admin) |
| Registration gates | `lifecycle_status = registration_open` on the active tournament |
| Player data isolation | All registrations, teams, and waitlist rows are scoped by `tournament_id` |
| Copy prior settings | Venue, fees, capacity, Venmo, tee time only — no player/team/waitlist copy |

Organizer runbook: [launch-handoff.md](./qa/launch-handoff.md) (annual setup) and [post-event-checklist.md](./qa/post-event-checklist.md) (archive).

## Regenerate migrations (schema changes only)

When Drizzle schema files change:

```bash
npm run db:generate
```

Review generated SQL, then run `npm run db:migrate`.
