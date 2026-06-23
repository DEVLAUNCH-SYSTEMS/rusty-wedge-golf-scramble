import {
  applyCiGateDatabaseEnv,
  shouldForceCiGateDatabaseEnv,
} from "@/lib/db/ci-gate-env";

export type MigrationDatabaseTarget = {
  source: "DATABASE_URL_UNPOOLED" | "DATABASE_URL";
  hostname: string;
  database: string;
  isPooled: boolean;
  protocol: string;
  looksValid: boolean;
};

export function getMigrationDatabaseUrl(): string {
  applyCiGateDatabaseEnv(shouldForceCiGateDatabaseEnv());

  const url =
    process.env.CI_GATE_DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.CI_GATE_DATABASE_URL ??
    process.env.DATABASE_URL ??
    "";

  if (!url) {
    throw new Error(
      "DATABASE_URL (or CI_GATE_DATABASE_URL / *_UNPOOLED) is not set for migrations.",
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

function resolveMigrationSource(): MigrationDatabaseTarget["source"] {
  if (process.env.CI_GATE_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL_UNPOOLED) {
    return "DATABASE_URL_UNPOOLED";
  }

  return "DATABASE_URL";
}

export function describeMigrationDatabaseTarget(): MigrationDatabaseTarget {
  return parseMigrationDatabaseTarget(
    resolveMigrationSource(),
    getMigrationDatabaseUrl(),
  );
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
