export const DATABASE_TARGET_ENV = "DATABASE_TARGET";
export const INTEGRATION_DATABASE_HOST_ENV = "INTEGRATION_DATABASE_HOST";
export const DEVELOPMENT_DATABASE_TARGET = "development";

export function normalizeIntegrationDatabaseHostname(hostname) {
  return hostname.replace("-pooler", "");
}

export function integrationHostnamesMatch(hostname, expectedHost) {
  return (
    normalizeIntegrationDatabaseHostname(hostname) ===
    normalizeIntegrationDatabaseHostname(expectedHost)
  );
}

export function readDatabaseTarget(env = process.env) {
  const value = env[DATABASE_TARGET_ENV]?.trim();
  return value || undefined;
}

export function readIntegrationDatabaseHost(env = process.env) {
  const value = env[INTEGRATION_DATABASE_HOST_ENV]?.trim();
  return value || undefined;
}

/**
 * Fail-closed guard for development-only maintenance scripts.
 * Mirrors lib/db/dev-fixture-cleanup-guard.ts without confirmation env.
 */
export function validateDevelopmentDatabaseScriptTarget(input) {
  if (input.ci === "true") {
    return { ok: false, reason: "CI=true is not allowed for development database scripts." };
  }

  if (input.runCiGate === "1") {
    return {
      ok: false,
      reason: "RUN_CI_GATE=1 is not allowed for development database scripts.",
    };
  }

  if (!input.databaseUrl && input.ciGateDatabaseUrl) {
    return {
      ok: false,
      reason:
        "DATABASE_URL is unset; script would fall through to CI_GATE_DATABASE_URL.",
    };
  }

  if (!input.databaseUrl) {
    return { ok: false, reason: "DATABASE_URL is required." };
  }

  if (!input.databaseTarget) {
    return { ok: false, reason: `${DATABASE_TARGET_ENV} is required.` };
  }

  if (input.databaseTarget !== DEVELOPMENT_DATABASE_TARGET) {
    return {
      ok: false,
      reason: `${DATABASE_TARGET_ENV} must be "${DEVELOPMENT_DATABASE_TARGET}".`,
    };
  }

  if (!input.expectedHost) {
    return { ok: false, reason: `${INTEGRATION_DATABASE_HOST_ENV} is required.` };
  }

  if (!integrationHostnamesMatch(input.hostname, input.expectedHost)) {
    return {
      ok: false,
      reason: `Hostname must exactly match ${INTEGRATION_DATABASE_HOST_ENV} (got "${input.hostname}").`,
    };
  }

  return { ok: true };
}
