import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { loadEnvFiles } from "@/lib/db/load-env";
import { getMigrationDatabaseUrl } from "@/lib/db/migration-url";

loadEnvFiles();

const MIGRATIONS_FOLDER = "./drizzle/migrations";

function formatMigrationError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}

async function runMigrations() {
  const connectionString = getMigrationDatabaseUrl();
  const pool = new Pool({ connectionString });

  try {
    await pool.query("select 1 as ok");
    console.log("Database connection OK.");

    const db = drizzle(pool);
    console.log(`Applying migrations from ${MIGRATIONS_FOLDER} …`);
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:");
    console.error(formatMigrationError(error));
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
