function normalizeDatabaseTarget(url: string): { host: string; database: string } {
  const parsed = new URL(url);

  return {
    host: parsed.hostname.replace("-pooler", ""),
    database: parsed.pathname.replace(/^\//, "") || "",
  };
}

function targetsSameDatabase(left: string, right: string): boolean {
  const a = normalizeDatabaseTarget(left);
  const b = normalizeDatabaseTarget(right);

  return a.host === b.host && a.database === b.database;
}

export function getTransactionalDatabaseUrl(): string {
  const runtimeUrl = process.env.DATABASE_URL;

  if (!runtimeUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const unpooledUrl = process.env.DATABASE_URL_UNPOOLED;

  if (unpooledUrl && targetsSameDatabase(runtimeUrl, unpooledUrl)) {
    return unpooledUrl;
  }

  return runtimeUrl;
}
