import { describe, expect, it } from "vitest";

import {
  DEV_BRANCH_HOST_TOKEN,
  FIXTURE_CLEANUP_CONFIRM_VALUE,
  validateFixtureCleanupGuard,
} from "@/lib/db/dev-fixture-cleanup-guard";
import {
  partitionTeamsByFixtureCatalog,
  summarizeFixtureCandidates,
} from "@/lib/services/fixture-team-cleanup";

const validDevHost = `ep-${DEV_BRANCH_HOST_TOKEN}-a6k4v8b2.us-west-2.aws.neon.tech`;

function validGuardInput(
  overrides: Partial<Parameters<typeof validateFixtureCleanupGuard>[0]> = {},
) {
  return {
    hostname: validDevHost,
    confirmEnv: FIXTURE_CLEANUP_CONFIRM_VALUE,
    ci: undefined,
    runCiGate: undefined,
    ciGateDatabaseUrl: undefined,
    databaseUrl: "postgresql://user:pass@ep-steep-block.us-west-2.aws.neon.tech/neondb",
    ...overrides,
  };
}

describe("fixture cleanup guard", () => {
  it("accepts the approved dev target with explicit confirmation", () => {
    expect(validateFixtureCleanupGuard(validGuardInput())).toEqual({ ok: true });
  });

  it("rejects CI execution contexts", () => {
    expect(validateFixtureCleanupGuard(validGuardInput({ ci: "true" }))).toEqual({
      ok: false,
      reason: "CI=true is not allowed for fixture team cleanup.",
    });
  });

  it("rejects RUN_CI_GATE execution mode", () => {
    expect(validateFixtureCleanupGuard(validGuardInput({ runCiGate: "1" }))).toEqual({
      ok: false,
      reason: "RUN_CI_GATE=1 is not allowed for fixture team cleanup.",
    });
  });

  it("rejects CI gate override when DATABASE_URL is unset", () => {
    expect(
      validateFixtureCleanupGuard(
        validGuardInput({
          databaseUrl: undefined,
          ciGateDatabaseUrl: "postgresql://ci",
        }),
      ),
    ).toEqual({
      ok: false,
      reason:
        "DATABASE_URL is unset; fixture cleanup would fall through to CI_GATE_DATABASE_URL.",
    });
  });

  it("rejects non-dev hostnames", () => {
    const result = validateFixtureCleanupGuard(
      validGuardInput({ hostname: "ep-prod-branch.us-west-2.aws.neon.tech" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain(DEV_BRANCH_HOST_TOKEN);
    }
  });

  it("rejects missing or wrong confirmation env", () => {
    expect(validateFixtureCleanupGuard(validGuardInput({ confirmEnv: undefined }))).toEqual({
      ok: false,
      reason: `FIXTURE_TEAM_CLEANUP_CONFIRM must be exactly "${FIXTURE_CLEANUP_CONFIRM_VALUE}".`,
    });
  });
});

describe("fixture team catalog partitioning", () => {
  it("selects only repository-proven fixture names", () => {
    const rows = [
      {
        id: "1",
        name: "Integration Team A",
        tournamentId: "t1",
        teamNumber: null,
        memberCount: 0,
      },
      {
        id: "2",
        name: "Team #4",
        tournamentId: "t1",
        teamNumber: null,
        memberCount: 0,
      },
      {
        id: "3",
        name: "Delete Test empty 2e7c1438-326b-47f7-b4e4-106e199c3afd",
        tournamentId: "t1",
        teamNumber: null,
        memberCount: 0,
      },
      {
        id: "4",
        name: "Delete Test mystery abc-def",
        tournamentId: "t1",
        teamNumber: null,
        memberCount: 0,
      },
    ];

    const { candidates, nonCatalog } = partitionTeamsByFixtureCatalog(rows);

    expect(candidates).toHaveLength(2);
    expect(candidates.map((row) => row.patternId)).toEqual([
      "integration-team-a",
      "delete-test-team-uuid",
    ]);
    expect(nonCatalog).toHaveLength(2);
  });

  it("summarizes zero-member vs populated fixture counts", () => {
    const summary = summarizeFixtureCandidates([
      {
        id: "1",
        name: "Integration Team A",
        tournamentId: "t1",
        teamNumber: null,
        memberCount: 0,
        patternId: "integration-team-a",
      },
      {
        id: "2",
        name: "Integration Team B",
        tournamentId: "t1",
        teamNumber: null,
        memberCount: 3,
        patternId: "integration-team-b",
      },
    ]);

    expect(summary.total).toBe(2);
    expect(summary.zeroMember).toBe(1);
    expect(summary.populated).toBe(1);
  });
});
