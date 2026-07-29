# Production migration plan (0001 lifecycle + provenance)

Phase F4 deliverable. Migration `0001_broad_archangel` adds tournament lifecycle columns, admin provenance fields, lifecycle backfill, and three partial unique indexes.

**Do not run `npm run db:migrate` against production until an organizer explicitly approves this plan.**

---

## What migration 0001 changes

| Change | Risk if preconditions fail |
|--------|------------------------------|
| `lifecycle_status` backfill from `is_active` + `registration_enabled` | Low — deterministic CASE update |
| `created_source` / admin FK columns on registrations & waitlist | Low — defaults to `public` |
| Partial unique index: one active tournament | **Blocks** if more than one `is_active = true` row exists |
| Partial unique: registration email per tournament (pending/confirmed) | **Blocks** if duplicate emails exist in those statuses |
| Partial unique: waitlist email per tournament (active) | **Blocks** if duplicate active waitlist emails exist |

SQL source: [`drizzle/migrations/0001_broad_archangel.sql`](../../drizzle/migrations/0001_broad_archangel.sql).

---

## Dev verification (completed)

Run against the Neon **dev** branch (`.env.local` `DATABASE_URL`):

| Step | Command | Dev result (2026-07-29) |
|------|---------|-------------------------|
| Target validation | `npm run db:verify-target` | Valid — unpooled host, `neondb` |
| Apply migrations | `npm run db:migrate` | Success (idempotent re-apply) |
| Schema integration | `npm run test -- tests/integration/phase-a-schema.integration.test.ts` | 4/4 passed |
| Read-only precheck | `npm run db:migration-precheck` | 1 active tournament, no duplicate emails, all three indexes present |

Dev precheck summary:

- Migrations applied: `0000_majestic_invisible_woman`, `0001_broad_archangel`
- Active tournament count: **1**
- Duplicate registration emails (pending/confirmed): **none**
- Duplicate active waitlist emails: **none**
- Indexes: `registrations_active_email_unique`, `tournaments_single_active_unique`, `waitlist_entries_active_email_unique`

---

## Recommended prod dry run (before live migrate)

Production holds real registrations and admin accounts. Validate on a **copy**, not live prod.

1. In Neon, create a **branch from production** (point-in-time copy).
2. Point a local env file (e.g. `.env.prod-check`, **not committed**) at the branch `DATABASE_URL`.
3. Run read-only checks only first:

```bash
DATABASE_URL='postgresql://…branch…' npm run db:verify-target
DATABASE_URL='postgresql://…branch…' npm run db:migration-precheck
```

4. If precheck exits **0**, run migrate on the **branch**:

```bash
DATABASE_URL='postgresql://…branch…' npm run db:migrate
DATABASE_URL='postgresql://…branch…' npm run test -- tests/integration/phase-a-schema.integration.test.ts
```

5. Spot-check lifecycle backfill on the branch (read-only SQL):

```sql
SELECT year, slug, is_active, registration_enabled, lifecycle_status, archived_at
FROM tournaments
ORDER BY year DESC, slug;
```

Expected mapping for existing rows:

| `is_active` | `registration_enabled` | `lifecycle_status` after migrate |
|-------------|------------------------|----------------------------------|
| `true` | `true` | `registration_open` |
| `true` | `false` | `registration_closed` |
| `false` | any | `archived` |

6. Delete the Neon branch when finished unless you need it for further QA.

---

## Production precheck (live — read only)

Before scheduling prod migrate, run precheck against **production** `DATABASE_URL` (read-only queries only):

```bash
DATABASE_URL='postgresql://…prod…' npm run db:migration-precheck
```

Resolve any reported blockers **before** migrate:

| Blocker | Resolution |
|---------|------------|
| Active tournament count > 1 | Deactivate extras via admin or one-off SQL so only one `is_active = true` remains |
| Duplicate registration emails | Merge/cancel duplicates in admin; only one pending/confirmed row per email per tournament |
| Duplicate waitlist emails | Resolve duplicates in admin before migrate |

Manual duplicate queries (Neon SQL editor or `psql`) if needed:

```sql
-- Registrations
SELECT tournament_id, lower(email) AS email, count(*) AS total
FROM registrations
WHERE registration_status IN ('pending_review', 'confirmed')
GROUP BY tournament_id, lower(email)
HAVING count(*) > 1;

-- Waitlist
SELECT tournament_id, lower(email) AS email, count(*) AS total
FROM waitlist_entries
WHERE status = 'active'
GROUP BY tournament_id, lower(email)
HAVING count(*) > 1;

-- Active tournaments
SELECT id, year, slug, name FROM tournaments WHERE is_active = true;
```

---

## Production migrate (when approved)

**Prerequisites:** Organizer sign-off, precheck exit 0 on prod (or prod branch dry run completed), deploy includes code that reads `lifecycle_status` and provenance columns.

1. **Maintenance window (optional):** Close registration in admin if you want zero new registrations during migrate (migrate itself is fast).
2. Confirm target:

```bash
DATABASE_URL='postgresql://…prod…' npm run db:verify-target
```

3. Final precheck:

```bash
DATABASE_URL='postgresql://…prod…' npm run db:migration-precheck
```

4. Migrate:

```bash
DATABASE_URL='postgresql://…prod…' npm run db:migrate
```

5. Post-migrate smoke:

```bash
DATABASE_URL='postgresql://…prod…' npm run db:migration-precheck
```

Expect all three indexes listed and no blockers.

6. Deploy application (if not already on lifecycle-aware build).
7. Organizer smoke: sign in, open `/admin/tournaments`, confirm lifecycle labels and registration list load.

---

## Explicit do-nots

| Action | Why |
|--------|-----|
| `npm run db:seed` on production | Overwrites or pollutes live data |
| `db:migrate` without precheck | Index creation can fail mid-migration on duplicates |
| Deactivating prod tournament without organizer approval | Affects live registration routing |
| Committing prod `DATABASE_URL` | Secrets must stay in env / Neon dashboard only |

---

## Rollback notes

Migration 0001 is **additive** (new columns, backfill, indexes). There is no automated down migration.

If migrate fails partway, inspect `drizzle.__drizzle_migrations` and PostgreSQL error logs. Fix data blockers and re-run `db:migrate` — Drizzle skips already-applied steps.

Rolling back **application code** without rolling back schema is safe only if the deployed build still tolerates the new columns (they have defaults). Rolling back schema on prod requires a manual DBA plan and is out of scope for V1.

---

## Related docs

- [post-event-checklist.md](./post-event-checklist.md) — lifecycle UI after migrate
- [admin-auth-audit-review.md](./admin-auth-audit-review.md) — mutation audit coverage
- [database-setup.md](../database-setup.md) — dev seed vs admin create
