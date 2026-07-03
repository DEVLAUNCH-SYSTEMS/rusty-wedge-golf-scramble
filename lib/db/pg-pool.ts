import { Pool } from "pg";

import { getTransactionalDatabaseUrl } from "@/lib/db/transactional-url";

let pool: Pool | undefined;

export function getPgPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getTransactionalDatabaseUrl() });
  }

  return pool;
}
