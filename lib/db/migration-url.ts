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
