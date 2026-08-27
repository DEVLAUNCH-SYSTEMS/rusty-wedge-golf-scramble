import { sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { loadEnvFiles } from "@/lib/db/load-env";
import {
  describeMigrationDatabaseTarget,
  validateMigrationDatabaseTarget,
} from "@/lib/db/migration-url";
import { getPgPool } from "@/lib/db/pg-pool";

loadEnvFiles();

type VerifyRow = Record<string, unknown>;

function logSection(title: string): void {
  console.log(`\n## ${title}`);
}

function logJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

async function readTeamNumberColumn(): Promise<VerifyRow | undefined> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'teams'
      AND column_name = 'team_number'
  `);

  return result.rows[0] as VerifyRow | undefined;
}

async function readTeamNumberIndex(): Promise<VerifyRow | undefined> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'teams_tournament_number_unique'
  `);

  return result.rows[0] as VerifyRow | undefined;
}

async function readAppliedMigrations(): Promise<VerifyRow[]> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT id, hash, created_at
    FROM drizzle.__drizzle_migrations
    ORDER BY created_at
  `);

  return result.rows as VerifyRow[];
}

async function readIntegrityCounts(): Promise<VerifyRow> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT
      (SELECT count(*)::int FROM teams) AS total_teams,
      (SELECT count(*)::int FROM teams WHERE team_number IS NULL) AS null_team_number,
      (SELECT count(*)::int FROM registrations) AS total_registrations,
      (SELECT count(*)::int FROM team_members) AS total_team_members,
      (
        SELECT count(*)::int
        FROM team_members tm
        LEFT JOIN teams t ON t.id = tm.team_id
        WHERE t.id IS NULL
      ) AS orphaned_team_members
  `);

  return result.rows[0] as VerifyRow;
}

async function verifyUniqueConstraintEnforced(): Promise<boolean> {
  const db = getDb();
  const tournament = (
    await db.execute(sql`
      SELECT id FROM tournaments WHERE is_active = true LIMIT 1
    `)
  ).rows[0] as { id: string } | undefined;

  if (!tournament) {
    console.log("Unique constraint smoke skipped — no active tournament.");
    return true;
  }

  const pool = getPgPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO teams (tournament_id, name, team_number)
       VALUES ($1, 'Gate B Smoke Team 1', 999991)`,
      [tournament.id],
    );

    let duplicateRejected = false;

    try {
      await client.query(
        `INSERT INTO teams (tournament_id, name, team_number)
         VALUES ($1, 'Gate B Smoke Team 2', 999991)`,
        [tournament.id],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      duplicateRejected = /teams_tournament_number_unique|duplicate key|unique/i.test(message);
    }

    await client.query("ROLLBACK");
    return duplicateRejected;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function runGateBVerify(): Promise<number> {
  const target = describeMigrationDatabaseTarget();
  console.log("STOP Gate B — team_number constraint verification (read-only + rollback smoke)");
  console.log(`Hostname: ${target.hostname}`);
  console.log(`Database: ${target.database}`);

  const validationError = validateMigrationDatabaseTarget(target);

  if (validationError) {
    console.error(`::error::${validationError}`);
    return 1;
  }

  const column = await readTeamNumberColumn();
  const index = await readTeamNumberIndex();
  const migrations = await readAppliedMigrations();
  const integrity = await readIntegrityCounts();
  const uniqueEnforced = await verifyUniqueConstraintEnforced();

  logSection("team_number column");
  logJson(column);

  logSection("teams_tournament_number_unique index");
  logJson(index);

  logSection("Applied migrations");
  logJson(migrations);

  logSection("Integrity counts");
  logJson(integrity);

  logSection("Unique constraint smoke (rolled back)");
  console.log(uniqueEnforced ? "duplicate insert rejected: yes" : "duplicate insert rejected: no");

  let exitCode = 0;

  if (column?.is_nullable !== "NO") {
    console.error("\n::error::teams.team_number is nullable — Phase C NOT NULL not applied.");
    exitCode = 1;
  }

  if (!index) {
    console.error("\n::error::teams_tournament_number_unique index missing.");
    exitCode = 1;
  }

  if (Number(integrity.null_team_number) > 0) {
    console.error("\n::error::NULL team_number rows remain.");
    exitCode = 1;
  }

  if (Number(integrity.orphaned_team_members) > 0) {
    console.error("\n::error::Orphaned team_members rows detected.");
    exitCode = 1;
  }

  if (!uniqueEnforced) {
    console.error("\n::error::Unique (tournament_id, team_number) constraint not enforced.");
    exitCode = 1;
  }

  if (migrations.length < 4) {
    console.error("\n::error::Expected at least 4 applied migrations (0003 Phase C missing).");
    exitCode = 1;
  }

  if (exitCode === 0) {
    console.log("\nGate B verification passed on this database.");
  }

  return exitCode;
}

runGateBVerify()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error("Gate B verification failed:", error);
    process.exit(1);
  });
