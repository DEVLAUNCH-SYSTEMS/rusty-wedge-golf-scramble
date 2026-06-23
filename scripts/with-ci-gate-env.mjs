#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

function applyCiGateDatabaseEnv(force = false) {
  const ciUrl = process.env.CI_GATE_DATABASE_URL;
  const ciUnpooled = process.env.CI_GATE_DATABASE_URL_UNPOOLED;

  if (ciUrl && (force || !process.env.DATABASE_URL)) {
    process.env.DATABASE_URL = ciUrl;
  }

  if (ciUnpooled && (force || !process.env.DATABASE_URL_UNPOOLED)) {
    process.env.DATABASE_URL_UNPOOLED = ciUnpooled;
  }
}

applyCiGateDatabaseEnv(true);

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/with-ci-gate-env.mjs <command> [args...]");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(
    "::error::CI_GATE_DATABASE_URL is not set. Add it to .env.local or GitHub Actions secrets.",
  );
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
