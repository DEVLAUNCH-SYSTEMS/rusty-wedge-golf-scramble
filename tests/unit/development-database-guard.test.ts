import { describe, expect, it } from "vitest";

import {
  DATABASE_TARGET_ENV,
  DEVELOPMENT_DATABASE_TARGET,
  INTEGRATION_DATABASE_HOST_ENV,
  integrationHostnamesMatch,
  normalizeIntegrationDatabaseHostname,
  validateDevelopmentDatabaseScriptTarget,
} from "../../scripts/lib/development-database-guard.mjs";

const DEV_HOST = "development-db.example.test";
const DEV_POOLER_HOST = "development-db-pooler.example.test";

function validScriptInput(
  overrides: Partial<Parameters<typeof validateDevelopmentDatabaseScriptTarget>[0]> = {},
) {
  return {
    hostname: DEV_HOST,
    databaseTarget: DEVELOPMENT_DATABASE_TARGET,
    expectedHost: DEV_HOST,
    ci: undefined,
    runCiGate: undefined,
    ciGateDatabaseUrl: undefined,
    databaseUrl: `postgresql://user:pass@${DEV_HOST}/neondb`,
    ...overrides,
  };
}

describe("development database script guard", () => {
  it("normalizes pooler hostnames for comparison", () => {
    expect(normalizeIntegrationDatabaseHostname(DEV_POOLER_HOST)).toBe(DEV_HOST);
    expect(integrationHostnamesMatch(DEV_POOLER_HOST, DEV_HOST)).toBe(true);
  });

  it("accepts the approved development target", () => {
    expect(validateDevelopmentDatabaseScriptTarget(validScriptInput())).toEqual({ ok: true });
  });

  it("accepts pooler runtime hostname when expected host is unpooled", () => {
    expect(
      validateDevelopmentDatabaseScriptTarget(
        validScriptInput({
          hostname: DEV_POOLER_HOST,
          databaseUrl: `postgresql://user:pass@${DEV_POOLER_HOST}/neondb`,
        }),
      ),
    ).toEqual({ ok: true });
  });

  it("rejects CI execution contexts", () => {
    expect(validateDevelopmentDatabaseScriptTarget(validScriptInput({ ci: "true" }))).toEqual({
      ok: false,
      reason: "CI=true is not allowed for development database scripts.",
    });
  });

  it("rejects RUN_CI_GATE execution mode", () => {
    expect(validateDevelopmentDatabaseScriptTarget(validScriptInput({ runCiGate: "1" }))).toEqual({
      ok: false,
      reason: "RUN_CI_GATE=1 is not allowed for development database scripts.",
    });
  });

  it("rejects production database target classification", () => {
    const result = validateDevelopmentDatabaseScriptTarget(
      validScriptInput({ databaseTarget: "production" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain(DATABASE_TARGET_ENV);
    }
  });

  it("rejects missing integration hostname configuration", () => {
    const result = validateDevelopmentDatabaseScriptTarget(
      validScriptInput({ expectedHost: undefined }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain(INTEGRATION_DATABASE_HOST_ENV);
    }
  });

  it("rejects non-matching hostnames", () => {
    const result = validateDevelopmentDatabaseScriptTarget(
      validScriptInput({ hostname: "production-db.example.test" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain(INTEGRATION_DATABASE_HOST_ENV);
    }
  });
});
