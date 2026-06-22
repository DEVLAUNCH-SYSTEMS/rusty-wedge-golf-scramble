import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

function getMigrationDatabaseUrl(): string {
  // Prefer Neon direct (unpooled) URL for DDL; fall back to DATABASE_URL.
  const url =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

  if (!url) {
    throw new Error(
      "DATABASE_URL (or DATABASE_URL_UNPOOLED) is not set for migrations.",
    );
  }

  return url;
}

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getMigrationDatabaseUrl(),
  },
});
