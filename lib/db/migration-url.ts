export type MigrationDatabaseTarget = {
  source: "DATABASE_URL_UNPOOLED" | "DATABASE_URL";
  hostname: string;
  database: string;
  isPooled: boolean;
  protocol: string;
  looksValid: boolean;
};

export function getMigrationDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

  if (!url) {
    throw new Error(
      "DATABASE_URL (or DATABASE_URL_UNPOOLED) is not set for migrations.",
    );
  }

  return url;
}

function invalidMigrationTarget(
  source: MigrationDatabaseTarget["source"],
): MigrationDatabaseTarget {
  return {
    source,
    hostname: "(invalid URL)",
    database: "(invalid URL)",
    isPooled: false,
    protocol: "(invalid URL)",
    looksValid: false,
  };
}

function parseMigrationDatabaseTarget(
  source: MigrationDatabaseTarget["source"],
  url: string,
): MigrationDatabaseTarget {
  try {
    const parsed = new URL(url);

    return {
      source,
      hostname: parsed.hostname,
      database: parsed.pathname.replace(/^\//, "") || "(none)",
      isPooled: parsed.hostname.includes("-pooler"),
      protocol: parsed.protocol.replace(":", ""),
      looksValid:
        parsed.protocol === "postgresql:" || parsed.protocol === "postgres:",
    };
  } catch {
    return invalidMigrationTarget(source);
  }
}

export function describeMigrationDatabaseTarget(): MigrationDatabaseTarget {
  const source: MigrationDatabaseTarget["source"] =
    process.env.DATABASE_URL_UNPOOLED ? "DATABASE_URL_UNPOOLED" : "DATABASE_URL";

  return parseMigrationDatabaseTarget(source, getMigrationDatabaseUrl());
}

export function validateMigrationDatabaseTarget(
  target: MigrationDatabaseTarget,
): string | undefined {
  if (!target.looksValid) {
    return `${target.source} must start with postgresql:// or postgres://`;
  }

  if (target.hostname === "base") {
    return `${target.source} parsed hostname "base" — likely a malformed URL or unencoded @ in the password. Re-copy the full string from Neon.`;
  }

  if (!target.hostname.includes(".") && target.hostname !== "localhost") {
    return `${target.source} hostname "${target.hostname}" does not look like a Neon host (expected ep-….neon.tech).`;
  }

  return undefined;
}
