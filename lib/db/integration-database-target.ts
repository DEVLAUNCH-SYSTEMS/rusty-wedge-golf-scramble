import {
  applyCiGateDatabaseEnv,
  shouldForceCiGateDatabaseEnv,
} from "@/lib/db/ci-gate-env";
import {
  describeMigrationDatabaseTarget,
  type MigrationDatabaseTarget,
  validateMigrationDatabaseTarget,
} from "@/lib/db/migration-url";

export const DATABASE_TARGET_ENV = "DATABASE_TARGET";
export const INTEGRATION_DATABASE_HOST_ENV = "INTEGRATION_DATABASE_HOST";
export const DEVELOPMENT_DATABASE_TARGET = "development";

export const INTEGRATION_DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "CI_GATE_DATABASE_URL",
  "CI_GATE_DATABASE_URL_UNPOOLED",
] as const;

export type IntegrationDatabaseUrlSource =
  (typeof INTEGRATION_DATABASE_URL_ENV_KEYS)[number];

export type ParsedIntegrationDatabaseUrl = {
  source: IntegrationDatabaseUrlSource;
  url: string;
  hostname: string;
  database: string;
  isPooled: boolean;
};

export type IntegrationDatabaseTargetAssessment = {
  resolved: MigrationDatabaseTarget;
  configuredUrls: ParsedIntegrationDatabaseUrl[];
  hostnameMismatches: ParsedIntegrationDatabaseUrl[];
  configuredHostConflicts: ParsedIntegrationDatabaseUrl[];
  databaseTarget: string | undefined;
  expectedHost: string | undefined;
};

function parseDatabaseUrl(
  source: IntegrationDatabaseUrlSource,
  url: string,
): ParsedIntegrationDatabaseUrl | null {
  try {
    const parsed = new URL(url);

    return {
      source,
      url,
      hostname: parsed.hostname,
      database: parsed.pathname.replace(/^\//, "") || "(none)",
      isPooled: parsed.hostname.includes("-pooler"),
    };
  } catch {
    return null;
  }
}

export function readDatabaseTarget(): string | undefined {
  const value = process.env[DATABASE_TARGET_ENV]?.trim();
  return value || undefined;
}

export function readIntegrationDatabaseHost(): string | undefined {
  const value = process.env[INTEGRATION_DATABASE_HOST_ENV]?.trim();
  return value || undefined;
}

export function listConfiguredIntegrationDatabaseUrls(): ParsedIntegrationDatabaseUrl[] {
  const rows: ParsedIntegrationDatabaseUrl[] = [];

  for (const source of INTEGRATION_DATABASE_URL_ENV_KEYS) {
    const url = process.env[source]?.trim();

    if (!url) {
      continue;
    }

    const parsed = parseDatabaseUrl(source, url);

    if (parsed) {
      rows.push(parsed);
    }
  }

  return rows;
}

function listInvalidConfiguredIntegrationDatabaseUrls(): IntegrationDatabaseUrlSource[] {
  const invalid: IntegrationDatabaseUrlSource[] = [];

  for (const source of INTEGRATION_DATABASE_URL_ENV_KEYS) {
    const url = process.env[source]?.trim();

    if (!url) {
      continue;
    }

    if (!parseDatabaseUrl(source, url)) {
      invalid.push(source);
    }
  }

  return invalid;
}

export function normalizeIntegrationDatabaseHostname(hostname: string): string {
  return hostname.replace("-pooler", "");
}

function integrationHostnamesMatch(
  hostname: string,
  expectedHost: string,
): boolean {
  return (
    normalizeIntegrationDatabaseHostname(hostname) ===
    normalizeIntegrationDatabaseHostname(expectedHost)
  );
}

function collectHostnameMismatches(
  configuredUrls: ParsedIntegrationDatabaseUrl[],
  expectedHost: string,
): ParsedIntegrationDatabaseUrl[] {
  return configuredUrls.filter(
    (entry) => !integrationHostnamesMatch(entry.hostname, expectedHost),
  );
}

const DATABASE_URL_OVERRIDE_PAIRS: Array<
  [IntegrationDatabaseUrlSource, IntegrationDatabaseUrlSource]
> = [
  ["DATABASE_URL", "CI_GATE_DATABASE_URL"],
  ["DATABASE_URL_UNPOOLED", "CI_GATE_DATABASE_URL_UNPOOLED"],
];

function collectConfiguredHostConflicts(
  configuredUrls: ParsedIntegrationDatabaseUrl[],
): ParsedIntegrationDatabaseUrl[] {
  const bySource = new Map(configuredUrls.map((entry) => [entry.source, entry]));
  const conflicts: ParsedIntegrationDatabaseUrl[] = [];

  for (const [leftSource, rightSource] of DATABASE_URL_OVERRIDE_PAIRS) {
    const left = bySource.get(leftSource);
    const right = bySource.get(rightSource);

    if (!left || !right) {
      continue;
    }

    if (!integrationHostnamesMatch(left.hostname, right.hostname)) {
      conflicts.push(right);
    }
  }

  return conflicts;
}

export function assessIntegrationDatabaseTarget(): IntegrationDatabaseTargetAssessment {
  const databaseTarget = readDatabaseTarget();
  const expectedHost = readIntegrationDatabaseHost();
  const configuredUrlsBeforeApply = listConfiguredIntegrationDatabaseUrls();

  applyCiGateDatabaseEnv(shouldForceCiGateDatabaseEnv());

  const configuredUrls = listConfiguredIntegrationDatabaseUrls();
  const hostnameMismatches = expectedHost
    ? collectHostnameMismatches(configuredUrlsBeforeApply, expectedHost)
    : configuredUrlsBeforeApply;
  const configuredHostConflicts =
    collectConfiguredHostConflicts(configuredUrlsBeforeApply);

  return {
    resolved: describeMigrationDatabaseTarget(),
    configuredUrls,
    hostnameMismatches,
    configuredHostConflicts,
    databaseTarget,
    expectedHost,
  };
}

function appendConfiguredUrlLines(
  lines: string[],
  configuredUrls: ParsedIntegrationDatabaseUrl[],
): void {
  if (configuredUrls.length === 0) {
    lines.push("", "No database URL environment values are configured.");
    return;
  }

  lines.push("", "Configured database URL environment values:");

  for (const entry of configuredUrls) {
    lines.push(
      `  ${entry.source}: hostname=${entry.hostname}, database=${entry.database}, pooled=${entry.isPooled ? "yes" : "no"}`,
    );
  }
}

function appendConfiguredHostConflictLines(
  lines: string[],
  configuredHostConflicts: ParsedIntegrationDatabaseUrl[],
): void {
  if (configuredHostConflicts.length === 0) {
    return;
  }

  lines.push("", "Configured database URL overrides point at different hostnames:");

  for (const entry of configuredHostConflicts) {
    lines.push(`  ${entry.source} → ${entry.hostname}`);
  }
}

function appendHostnameMismatchLines(
  lines: string[],
  expectedHost: string | undefined,
  hostnameMismatches: ParsedIntegrationDatabaseUrl[],
): void {
  if (hostnameMismatches.length === 0) {
    return;
  }

  lines.push(
    "",
    `Configured database URL hostnames must exactly match ${INTEGRATION_DATABASE_HOST_ENV}${expectedHost ? ` (${expectedHost})` : ""}:`,
  );

  for (const entry of hostnameMismatches) {
    lines.push(`  ${entry.source} → ${entry.hostname}`);
  }
}

export function formatIntegrationDatabaseRefusal(
  assessment: IntegrationDatabaseTargetAssessment,
  reason: string,
): string {
  const lines = [
    reason,
    "",
    `Database target classification: ${assessment.databaseTarget ?? "(unset)"}`,
    `Expected integration hostname (${INTEGRATION_DATABASE_HOST_ENV}): ${assessment.expectedHost ?? "(unset)"}`,
    "",
    "Resolved integration database target:",
    `  source: ${assessment.resolved.source}`,
    `  hostname: ${assessment.resolved.hostname}`,
    `  database: ${assessment.resolved.database}`,
    `  pooled: ${assessment.resolved.isPooled ? "yes" : "no"}`,
  ];

  appendConfiguredUrlLines(lines, assessment.configuredUrls);
  appendHostnameMismatchLines(
    lines,
    assessment.expectedHost,
    assessment.hostnameMismatches,
  );
  appendConfiguredHostConflictLines(lines, assessment.configuredHostConflicts);
  lines.push(
    "",
    "DB-mutating integration tests require explicit development classification and a matching integration hostname.",
    `Set ${DATABASE_TARGET_ENV}=${DEVELOPMENT_DATABASE_TARGET} and ${INTEGRATION_DATABASE_HOST_ENV} in local or CI environment configuration.`,
  );

  return lines.join("\n");
}

function refuseIntegrationTarget(
  assessment: IntegrationDatabaseTargetAssessment,
  reason: string,
): { ok: false; assessment: IntegrationDatabaseTargetAssessment; message: string } {
  return {
    ok: false,
    assessment,
    message: formatIntegrationDatabaseRefusal(assessment, reason),
  };
}

function validateDatabaseTargetClassification(
  assessment: IntegrationDatabaseTargetAssessment,
):
  | { ok: true }
  | { ok: false; assessment: IntegrationDatabaseTargetAssessment; message: string } {
  if (!assessment.databaseTarget) {
    return refuseIntegrationTarget(
      assessment,
      `Refusing DB-mutating integration tests: ${DATABASE_TARGET_ENV} is required.`,
    );
  }

  if (assessment.databaseTarget !== DEVELOPMENT_DATABASE_TARGET) {
    return refuseIntegrationTarget(
      assessment,
      `Refusing DB-mutating integration tests: ${DATABASE_TARGET_ENV} must be "${DEVELOPMENT_DATABASE_TARGET}".`,
    );
  }

  if (!assessment.expectedHost) {
    return refuseIntegrationTarget(
      assessment,
      `Refusing DB-mutating integration tests: ${INTEGRATION_DATABASE_HOST_ENV} is required.`,
    );
  }

  return { ok: true };
}

function validateConfiguredDatabaseUrls(
  assessment: IntegrationDatabaseTargetAssessment,
):
  | { ok: true }
  | { ok: false; assessment: IntegrationDatabaseTargetAssessment; message: string } {
  const invalidSources = listInvalidConfiguredIntegrationDatabaseUrls();

  if (invalidSources.length > 0) {
    return refuseIntegrationTarget(
      assessment,
      `Refusing DB-mutating integration tests: invalid database URL on ${invalidSources.join(", ")}.`,
    );
  }

  if (assessment.configuredHostConflicts.length > 0) {
    return refuseIntegrationTarget(
      assessment,
      "Refusing DB-mutating integration tests: configured database URL overrides point at different hostnames.",
    );
  }

  if (assessment.hostnameMismatches.length > 0) {
    return refuseIntegrationTarget(
      assessment,
      "Refusing DB-mutating integration tests: a configured database URL hostname does not match the expected integration hostname.",
    );
  }

  return { ok: true };
}

function validateResolvedIntegrationHostname(
  assessment: IntegrationDatabaseTargetAssessment,
):
  | { ok: true }
  | { ok: false; assessment: IntegrationDatabaseTargetAssessment; message: string } {
  if (
    !assessment.expectedHost ||
    !integrationHostnamesMatch(assessment.resolved.hostname, assessment.expectedHost)
  ) {
    return refuseIntegrationTarget(
      assessment,
      "Refusing DB-mutating integration tests: resolved database hostname does not match the expected integration hostname.",
    );
  }

  return { ok: true };
}

export function validateIntegrationDatabaseTargetForMutatingTests():
  | { ok: true; assessment: IntegrationDatabaseTargetAssessment }
  | { ok: false; assessment: IntegrationDatabaseTargetAssessment; message: string } {
  const assessment = assessIntegrationDatabaseTarget();

  const classificationValidation = validateDatabaseTargetClassification(assessment);

  if (!classificationValidation.ok) {
    return classificationValidation;
  }

  const configuredUrlValidation = validateConfiguredDatabaseUrls(assessment);

  if (!configuredUrlValidation.ok) {
    return configuredUrlValidation;
  }

  const migrationValidationError = validateMigrationDatabaseTarget(assessment.resolved);

  if (migrationValidationError) {
    return refuseIntegrationTarget(
      assessment,
      `Refusing DB-mutating integration tests: ${migrationValidationError}`,
    );
  }

  const hostnameValidation = validateResolvedIntegrationHostname(assessment);

  if (!hostnameValidation.ok) {
    return hostnameValidation;
  }

  return { ok: true, assessment };
}
