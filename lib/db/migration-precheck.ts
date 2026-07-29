import { sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { loadEnvFiles } from "@/lib/db/load-env";
import {
  describeMigrationDatabaseTarget,
  validateMigrationDatabaseTarget,
} from "@/lib/db/migration-url";

loadEnvFiles();

type PrecheckRow = Record<string, unknown>;

function logSection(title: string): void {
  console.log(`\n## ${title}`);
}

function logRows(rows: PrecheckRow[]): void {
  if (rows.length === 0) {
    console.log("(none)");
    return;
  }

  console.log(JSON.stringify(rows, null, 2));
}

async function listAppliedMigrations(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT id, hash, created_at
    FROM drizzle.__drizzle_migrations
    ORDER BY created_at
  `);

  return result.rows as PrecheckRow[];
}

async function countActiveTournaments(): Promise<number> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT count(*)::int AS total
    FROM tournaments
    WHERE is_active = true
  `);

  return Number((result.rows[0] as PrecheckRow)?.total ?? 0);
}

async function listDuplicateRegistrationEmails(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT tournament_id, lower(email) AS email, count(*)::int AS total
    FROM registrations
    WHERE registration_status IN ('pending_review', 'confirmed')
    GROUP BY tournament_id, lower(email)
    HAVING count(*) > 1
    ORDER BY total DESC, email
    LIMIT 20
  `);

  return result.rows as PrecheckRow[];
}

async function listDuplicateWaitlistEmails(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT tournament_id, lower(email) AS email, count(*)::int AS total
    FROM waitlist_entries
    WHERE status = 'active'
    GROUP BY tournament_id, lower(email)
    HAVING count(*) > 1
    ORDER BY total DESC, email
    LIMIT 20
  `);

  return result.rows as PrecheckRow[];
}

async function listTournamentLifecycleSummary(): Promise<PrecheckRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      year,
      slug,
      is_active,
      registration_enabled,
      lifecycle_status,
      archived_at IS NOT NULL AS is_archived
    FROM tournaments
    ORDER BY year DESC, slug
    LIMIT 20
  `);

  return result.rows as PrecheckRow[];
}

async function listRequiredIndexes(): Promise<string[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN (
        'tournaments_single_active_unique',
        'registrations_active_email_unique',
        'waitlist_entries_active_email_unique'
      )
    ORDER BY indexname
  `);

  return (result.rows as { indexname: string }[]).map((row) => row.indexname);
}

async function runPrecheck(): Promise<number> {
  const target = describeMigrationDatabaseTarget();
  console.log("Migration precheck (read-only)");
  console.log(`Hostname: ${target.hostname}`);
  console.log(`Database: ${target.database}`);

  const validationError = validateMigrationDatabaseTarget(target);

  if (validationError) {
    console.error(`::error::${validationError}`);
    return 1;
  }

  logSection("Applied migrations");
  logRows(await listAppliedMigrations());

  logSection("Tournament lifecycle summary (latest 20)");
  logRows(await listTournamentLifecycleSummary());

  const activeCount = await countActiveTournaments();
  logSection("Active tournament count");
  console.log(activeCount);

  logSection("Duplicate registration emails (pending/confirmed)");
  const registrationDuplicates = await listDuplicateRegistrationEmails();
  logRows(registrationDuplicates);

  logSection("Duplicate active waitlist emails");
  const waitlistDuplicates = await listDuplicateWaitlistEmails();
  logRows(waitlistDuplicates);

  logSection("Required partial indexes");
  console.log((await listRequiredIndexes()).join(", ") || "(missing — migration 0001 not applied)");

  let exitCode = 0;

  if (activeCount > 1) {
    console.error(
      "\n::error::More than one active tournament — fix before applying migration 0001.",
    );
    exitCode = 1;
  }

  if (registrationDuplicates.length > 0) {
    console.error(
      "\n::error::Duplicate registration emails would block registrations_active_email_unique.",
    );
    exitCode = 1;
  }

  if (waitlistDuplicates.length > 0) {
    console.error(
      "\n::error::Duplicate waitlist emails would block waitlist_entries_active_email_unique.",
    );
    exitCode = 1;
  }

  const indexes = await listRequiredIndexes();
  const expectedIndexes = [
    "registrations_active_email_unique",
    "tournaments_single_active_unique",
    "waitlist_entries_active_email_unique",
  ];

  if (indexes.length === expectedIndexes.length) {
    console.log("\nPrecheck complete — schema indexes present (post-migration state).");
  } else if (exitCode === 0) {
    console.log(
      "\nPrecheck complete — no blockers found. Safe to run db:migrate if indexes are not yet present.",
    );
  } else {
    console.log("\nPrecheck failed — resolve blockers before db:migrate.");
  }

  return exitCode;
}

runPrecheck()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error("Precheck failed:", error);
    process.exit(1);
  });
