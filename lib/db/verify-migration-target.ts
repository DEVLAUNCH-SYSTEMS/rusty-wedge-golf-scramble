import { loadEnvFiles } from "@/lib/db/load-env";
import {
  describeMigrationDatabaseTarget,
  validateMigrationDatabaseTarget,
} from "@/lib/db/migration-url";

loadEnvFiles();

const target = describeMigrationDatabaseTarget();

console.log(
  `CI_GATE_DATABASE_URL set: ${process.env.CI_GATE_DATABASE_URL ? "yes" : "no"}`,
);
console.log(
  `DATABASE_URL set: ${process.env.DATABASE_URL ? "yes" : "no"}`,
);
console.log(
  `DATABASE_URL_UNPOOLED set: ${process.env.DATABASE_URL_UNPOOLED ? "yes" : "no"}`,
);
console.log(`Migration source: ${target.source}`);
console.log(`Protocol: ${target.protocol}`);
console.log(`Hostname: ${target.hostname}`);
console.log(`Database: ${target.database}`);
console.log(`Pooled host: ${target.isPooled ? "yes" : "no"}`);

const validationError = validateMigrationDatabaseTarget(target);

if (validationError) {
  console.error(`::error::${validationError}`);
  process.exit(1);
}

console.log("Migration database target looks valid.");
