import {
  DATABASE_TARGET_ENV,
  DEVELOPMENT_DATABASE_TARGET,
  INTEGRATION_DATABASE_HOST_ENV,
  normalizeIntegrationDatabaseHostname,
} from "@/lib/db/integration-database-target";

export const FIXTURE_CLEANUP_CONFIRM_VALUE = "confirm-dev-fixture-cleanup";

export type FixtureCleanupGuardInput = {
  hostname: string;
  confirmEnv: string | undefined;
  databaseTarget: string | undefined;
  expectedHost: string | undefined;
  ci: string | undefined;
  runCiGate: string | undefined;
  ciGateDatabaseUrl: string | undefined;
  databaseUrl: string | undefined;
};

export type FixtureCleanupGuardResult =
  | { ok: true }
  | { ok: false; reason: string };

function rejectExecutionContext(
  input: FixtureCleanupGuardInput,
): FixtureCleanupGuardResult | null {
  if (input.ci === "true") {
    return { ok: false, reason: "CI=true is not allowed for fixture team cleanup." };
  }

  if (input.runCiGate === "1") {
    return { ok: false, reason: "RUN_CI_GATE=1 is not allowed for fixture team cleanup." };
  }

  if (!input.databaseUrl && input.ciGateDatabaseUrl) {
    return {
      ok: false,
      reason:
        "DATABASE_URL is unset; fixture cleanup would fall through to CI_GATE_DATABASE_URL.",
    };
  }

  return null;
}

function rejectDevTarget(input: FixtureCleanupGuardInput): FixtureCleanupGuardResult | null {
  if (!input.databaseUrl) {
    return { ok: false, reason: "DATABASE_URL is required." };
  }

  if (!input.databaseTarget) {
    return {
      ok: false,
      reason: `${DATABASE_TARGET_ENV} is required.`,
    };
  }

  if (input.databaseTarget !== DEVELOPMENT_DATABASE_TARGET) {
    return {
      ok: false,
      reason: `${DATABASE_TARGET_ENV} must be "${DEVELOPMENT_DATABASE_TARGET}".`,
    };
  }

  if (!input.expectedHost) {
    return {
      ok: false,
      reason: `${INTEGRATION_DATABASE_HOST_ENV} is required.`,
    };
  }

  if (
    normalizeIntegrationDatabaseHostname(input.hostname) !==
    normalizeIntegrationDatabaseHostname(input.expectedHost)
  ) {
    return {
      ok: false,
      reason: `Hostname must exactly match ${INTEGRATION_DATABASE_HOST_ENV} (got "${input.hostname}").`,
    };
  }

  if (input.confirmEnv !== FIXTURE_CLEANUP_CONFIRM_VALUE) {
    return {
      ok: false,
      reason: `FIXTURE_TEAM_CLEANUP_CONFIRM must be exactly "${FIXTURE_CLEANUP_CONFIRM_VALUE}".`,
    };
  }

  return null;
}

export function validateFixtureCleanupGuard(
  input: FixtureCleanupGuardInput,
): FixtureCleanupGuardResult {
  return rejectExecutionContext(input) ?? rejectDevTarget(input) ?? { ok: true };
}
