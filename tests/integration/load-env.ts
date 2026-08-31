import { afterEach, beforeAll, beforeEach } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import {
  assessIntegrationDatabaseTarget,
  validateIntegrationDatabaseTargetForMutatingTests,
} from "@/lib/db/integration-database-target";
import {
  formatIntegrationFixtureLeakIncrease,
  integrationFixtureCountsIncreased,
  type IntegrationFixtureLeakCounts,
} from "@/lib/db/integration-fixture-leak";
import { loadEnvFiles } from "@/lib/db/load-env";
import { scanIntegrationFixtureLeaks } from "@/lib/services/integration-fixture-leak-scan";

import {
  cleanupIntegrationFixtureRegistry,
  integrationFixtureRegistry,
} from "./fixture-registry";

process.env.RUN_CI_GATE = "1";
loadEnvFiles();

let fixtureCountsBeforeTest: IntegrationFixtureLeakCounts | null = null;

beforeAll(() => {
  if (!hasIntegrationDatabase()) {
    return;
  }

  const validation = validateIntegrationDatabaseTargetForMutatingTests();

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const assessment = assessIntegrationDatabaseTarget();
  console.log(
    [
      "Integration database target verified.",
      `  database target: ${assessment.databaseTarget}`,
      `  expected host: ${assessment.expectedHost}`,
      `  resolved hostname: ${assessment.resolved.hostname}`,
      `  database: ${assessment.resolved.database}`,
      `  source: ${assessment.resolved.source}`,
    ].join("\n"),
  );
});

beforeEach(async () => {
  if (!hasIntegrationDatabase()) {
    return;
  }

  fixtureCountsBeforeTest = (await scanIntegrationFixtureLeaks()).counts;
});

afterEach(async () => {
  if (!hasIntegrationDatabase() || !fixtureCountsBeforeTest) {
    return;
  }

  await cleanupIntegrationFixtureRegistry(integrationFixtureRegistry);

  const fixtureCountsAfterTest = (await scanIntegrationFixtureLeaks()).counts;

  if (integrationFixtureCountsIncreased(fixtureCountsBeforeTest, fixtureCountsAfterTest)) {
    throw new Error(
      formatIntegrationFixtureLeakIncrease(
        fixtureCountsBeforeTest,
        fixtureCountsAfterTest,
      ),
    );
  }
});
