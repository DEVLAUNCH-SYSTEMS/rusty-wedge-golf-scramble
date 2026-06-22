import { Pool } from "pg";

import { getMigrationDatabaseUrl } from "@/lib/db/migration-url";

let pool: Pool | undefined;

export function getPgPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getMigrationDatabaseUrl() });
  }

  return pool;
}
