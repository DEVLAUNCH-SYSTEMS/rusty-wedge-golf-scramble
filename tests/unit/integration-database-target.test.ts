import { describe, expect, it } from "vitest";

import {
  DATABASE_TARGET_ENV,
  DEVELOPMENT_DATABASE_TARGET,
  INTEGRATION_DATABASE_HOST_ENV,
  assessIntegrationDatabaseTarget,
  formatIntegrationDatabaseRefusal,
  listConfiguredIntegrationDatabaseUrls,
  validateIntegrationDatabaseTargetForMutatingTests,
} from "@/lib/db/integration-database-target";

const DEV_HOST = "development-db.example.test";
const PROD_HOST = "production-db.example.test";

const DEV_POOLED = `postgresql://user:pass@development-db-pooler.example.test/neondb?sslmode=require`;
const DEV_UNPOOLED = `postgresql://user:pass@${DEV_HOST}/neondb?sslmode=require`;
const PROD_POOLED = `postgresql://user:pass@production-db-pooler.example.test/neondb?sslmode=require`;
const PROD_UNPOOLED = `postgresql://user:pass@${PROD_HOST}/neondb?sslmode=require`;

function withEnv(
  values: Record<string, string | undefined>,
  run: () => void,
): void {
  const prior = new Map<string, string | undefined>();

  for (const key of Object.keys(values)) {
    prior.set(key, process.env[key]);
    const next = values[key];

    if (next === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = next;
    }
  }

  try {
    run();
  } finally {
    for (const [key, value] of prior.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function validDevelopmentEnv(
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  return {
    [DATABASE_TARGET_ENV]: DEVELOPMENT_DATABASE_TARGET,
    [INTEGRATION_DATABASE_HOST_ENV]: DEV_HOST,
    DATABASE_URL: DEV_POOLED,
    CI_GATE_DATABASE_URL: DEV_POOLED,
    DATABASE_URL_UNPOOLED: DEV_UNPOOLED,
    CI_GATE_DATABASE_URL_UNPOOLED: undefined,
    RUN_CI_GATE: "1",
    ...overrides,
  };
}

describe("integration database target guard", () => {
  it("lists configured database URL sources", () => {
    withEnv(validDevelopmentEnv(), () => {
      const urls = listConfiguredIntegrationDatabaseUrls();
      expect(urls.map((entry) => entry.source)).toEqual([
        "DATABASE_URL",
        "DATABASE_URL_UNPOOLED",
        "CI_GATE_DATABASE_URL",
      ]);
    });
  });

  it("rejects when DATABASE_TARGET is production", () => {
    withEnv(
      validDevelopmentEnv({
        [DATABASE_TARGET_ENV]: "production",
      }),
      () => {
        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.message).toContain(DEVELOPMENT_DATABASE_TARGET);
        }
      },
    );
  });

  it("rejects when DATABASE_TARGET is missing", () => {
    withEnv(
      validDevelopmentEnv({
        [DATABASE_TARGET_ENV]: undefined,
      }),
      () => {
        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.message).toContain(DATABASE_TARGET_ENV);
        }
      },
    );
  });

  it("rejects when INTEGRATION_DATABASE_HOST is missing", () => {
    withEnv(
      validDevelopmentEnv({
        [INTEGRATION_DATABASE_HOST_ENV]: undefined,
      }),
      () => {
        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.message).toContain(INTEGRATION_DATABASE_HOST_ENV);
        }
      },
    );
  });

  it("rejects when resolved URL hostname does not match expected integration host", () => {
    withEnv(
      validDevelopmentEnv({
        DATABASE_URL: PROD_UNPOOLED,
        CI_GATE_DATABASE_URL: undefined,
        DATABASE_URL_UNPOOLED: undefined,
        RUN_CI_GATE: undefined,
      }),
      () => {
        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.message).toContain("does not match the expected integration hostname");
        }
      },
    );
  });

  it("rejects when CI_GATE_DATABASE_URL overrides to a different host", () => {
    withEnv(
      validDevelopmentEnv({
        DATABASE_URL: DEV_POOLED,
        CI_GATE_DATABASE_URL: PROD_POOLED,
        DATABASE_URL_UNPOOLED: undefined,
        CI_GATE_DATABASE_URL_UNPOOLED: undefined,
        RUN_CI_GATE: "1",
      }),
      () => {
        const assessment = assessIntegrationDatabaseTarget();
        expect(assessment.configuredHostConflicts.map((entry) => entry.source)).toContain(
          "CI_GATE_DATABASE_URL",
        );

        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
      },
    );
  });

  it("rejects when unpooled override points at a different host", () => {
    withEnv(
      validDevelopmentEnv({
        CI_GATE_DATABASE_URL_UNPOOLED: PROD_UNPOOLED,
      }),
      () => {
        const assessment = assessIntegrationDatabaseTarget();
        expect(assessment.hostnameMismatches.map((entry) => entry.source)).toContain(
          "CI_GATE_DATABASE_URL_UNPOOLED",
        );

        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
      },
    );
  });

  it("rejects invalid configured database URLs", () => {
    withEnv(
      validDevelopmentEnv({
        DATABASE_URL: "not-a-valid-url",
        DATABASE_URL_UNPOOLED: undefined,
        CI_GATE_DATABASE_URL: undefined,
        RUN_CI_GATE: undefined,
      }),
      () => {
        const result = validateIntegrationDatabaseTargetForMutatingTests();
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.message).toContain("invalid database URL");
        }
      },
    );
  });

  it("permits the configured development integration target", () => {
    withEnv(validDevelopmentEnv(), () => {
      const result = validateIntegrationDatabaseTargetForMutatingTests();
      expect(result.ok).toBe(true);
      expect(result.assessment.resolved.hostname).toBe(DEV_HOST);
    });
  });

  it("includes resolved target details in refusal message", () => {
    withEnv(
      validDevelopmentEnv({
        DATABASE_URL: PROD_UNPOOLED,
        CI_GATE_DATABASE_URL: undefined,
        RUN_CI_GATE: undefined,
      }),
      () => {
        const assessment = assessIntegrationDatabaseTarget();
        const message = formatIntegrationDatabaseRefusal(
          assessment,
          "Refusing DB-mutating integration tests: resolved database hostname does not match the expected integration hostname.",
        );

        expect(message).toContain(PROD_HOST);
        expect(message).toContain("DATABASE_URL");
        expect(message).toContain(DEV_HOST);
      },
    );
  });
});

describe("integration fixture leak classification", () => {
  it("classifies integration test emails and admin prefixes", async () => {
    const { isIntegrationTestEmail, isIntegrationAdminNeonAuthUserId } =
      await import("@/lib/db/integration-fixture-leak");

    expect(isIntegrationTestEmail("player-123@example.com")).toBe(true);
    expect(isIntegrationTestEmail("player@rustywedge.com")).toBe(false);
    expect(isIntegrationAdminNeonAuthUserId("test-admin-abc")).toBe(true);
    expect(isIntegrationAdminNeonAuthUserId("neon-user-abc")).toBe(false);
  });
});
