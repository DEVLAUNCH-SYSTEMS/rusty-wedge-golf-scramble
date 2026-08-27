import { describe, expect, it } from "vitest";

import {
  classifyFixtureTeamName,
  listFixturePatternCatalog,
} from "@/lib/db/team-number-fixture-patterns";

describe("team number fixture pattern classification", () => {
  it("matches repository-known integration test team names", () => {
    expect(classifyFixtureTeamName("Audit Team")?.patternId).toBe("audit-team");
    expect(classifyFixtureTeamName("Integration Team A")?.patternId).toBe(
      "integration-team-a",
    );
    expect(classifyFixtureTeamName("Integration Team B")?.patternId).toBe(
      "integration-team-b",
    );
    expect(
      classifyFixtureTeamName(
        "H-edit team 8025feb8-f038-436b-84be-1850ff107c83",
      )?.patternId,
    ).toBe("h-edit-team-uuid");
    expect(
      classifyFixtureTeamName(
        "Delete Test empty 2e7c1438-326b-47f7-b4e4-106e199c3afd",
      )?.patternId,
    ).toBe("delete-test-team-uuid");
    expect(
      classifyFixtureTeamName(
        "Delete Test populated 5fa94aaa-f44b-4f9f-8c01-6f70d0072f7d",
      )?.patternId,
    ).toBe("delete-test-team-uuid");
    expect(
      classifyFixtureTeamName(
        "Delete Test other-tournament 0a899fe1-7742-4f10-8331-a14978775372",
      )?.patternId,
    ).toBe("delete-test-team-uuid");
  });

  it("does not classify unrelated Delete/Test names as fixtures", () => {
    expect(classifyFixtureTeamName("Delete Test empty")).toBeNull();
    expect(classifyFixtureTeamName("Delete Test mystery abc-def")).toBeNull();
    expect(classifyFixtureTeamName("Delete Test keep not-a-uuid")).toBeNull();
    expect(classifyFixtureTeamName("My Delete Test keep team")).toBeNull();
    expect(classifyFixtureTeamName("Team Delete Test empty uuid")).toBeNull();
  });

  it("does not classify organizer Team #N labels as fixtures", () => {
    expect(classifyFixtureTeamName("Team #14- Rusty Williams")).toBeNull();
    expect(classifyFixtureTeamName("Team #1")).toBeNull();
  });

  it("documents catalog entries with repository evidence", () => {
    const catalog = listFixturePatternCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(4);
    expect(catalog.every((entry) => entry.evidence.includes("tests/"))).toBe(true);
  });
});
