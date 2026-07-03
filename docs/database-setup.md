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

## Regenerate migrations (schema changes only)

When Drizzle schema files change:

```bash
npm run db:generate
```

Review generated SQL, then run `npm run db:migrate`.
