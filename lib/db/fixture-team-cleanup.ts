import { validateFixtureCleanupGuard } from "@/lib/db/dev-fixture-cleanup-guard";
import {
  readDatabaseTarget,
  readIntegrationDatabaseHost,
} from "@/lib/db/integration-database-target";
import { loadEnvFiles } from "@/lib/db/load-env";
import {
  describeMigrationDatabaseTarget,
  validateMigrationDatabaseTarget,
} from "@/lib/db/migration-url";
import {
  listAllTeamsWithMemberCounts,
  listRemainingNullTeamNumberRows,
  partitionTeamsByFixtureCatalog,
  runFixtureTeamCleanup,
  summarizeFixtureCandidates,
} from "@/lib/services/fixture-team-cleanup";

loadEnvFiles();

function readExecuteFlag(): boolean {
  return process.argv.includes("--execute");
}

function assertFixtureCleanupEnvironment(): void {
  const target = describeMigrationDatabaseTarget();
  const migrationError = validateMigrationDatabaseTarget(target);

  if (migrationError) {
    throw new Error(migrationError);
  }

  const guard = validateFixtureCleanupGuard({
    hostname: target.hostname,
    confirmEnv: process.env.FIXTURE_TEAM_CLEANUP_CONFIRM,
    databaseTarget: readDatabaseTarget(),
    expectedHost: readIntegrationDatabaseHost(),
    ci: process.env.CI,
    runCiGate: process.env.RUN_CI_GATE,
    ciGateDatabaseUrl: process.env.CI_GATE_DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL,
  });

  if (!guard.ok) {
    throw new Error(guard.reason);
  }

  console.log("Fixture team cleanup target (development only)");
  console.log(`Hostname: ${target.hostname}`);
  console.log(`Database: ${target.database}`);
}

async function logCandidatePreview(): Promise<void> {
  const rows = await listAllTeamsWithMemberCounts();
  const { candidates } = partitionTeamsByFixtureCatalog(rows);
  const summary = summarizeFixtureCandidates(candidates);

  console.log("\n## Fixture candidates");
  console.log(JSON.stringify(summary, null, 2));

  if (candidates.length > 0) {
    console.log("\nSample candidates (up to 10):");
    console.log(
      JSON.stringify(
        candidates.slice(0, 10).map((row) => ({
          id: row.id,
          name: row.name,
          patternId: row.patternId,
          memberCount: row.memberCount,
        })),
        null,
        2,
      ),
    );
  }
}

async function logRemainingNullRows(): Promise<void> {
  const rows = await listRemainingNullTeamNumberRows();
  const nonFixture = rows.filter((row) => !row.name.startsWith("Team #"));

  console.log("\n## Remaining NULL team_number rows (operator review)");
  console.log(`Total NULL: ${rows.length}`);
  console.log(JSON.stringify(rows, null, 2));

  if (nonFixture.length > 0) {
    console.log(
      `\n${nonFixture.length} non-catalog NULL row(s) require manual operator review.`,
    );
  }
}

async function main(): Promise<number> {
  try {
    assertFixtureCleanupEnvironment();
  } catch (error) {
    console.error(`::error::${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }

  const execute = readExecuteFlag();
  console.log(`Mode: ${execute ? "EXECUTE" : "DRY RUN"}`);

  if (!execute) {
    await logCandidatePreview();
  }

  const result = await runFixtureTeamCleanup(execute);

  console.log("\n## Cleanup result");
  console.log(JSON.stringify(result, null, 2));

  if (result.failures.length > 0) {
    console.error(`\n::error::${result.failures.length} fixture team deletion(s) failed.`);
    return 1;
  }

  if (execute) {
    console.log(
      `\nRegistration count unchanged: ${result.registrationsBefore === result.registrationsAfter ? "yes" : "no"} (${result.registrationsBefore} → ${result.registrationsAfter})`,
    );
  }

  if (execute || result.candidateCount === 0) {
    await logRemainingNullRows();
  }

  if (!execute && result.candidateCount > 0) {
    console.log(
      "\nDry run complete. Pass --execute to delete catalogued fixture teams.",
    );
  }

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error("Fixture team cleanup failed:", error);
    process.exit(1);
  });
