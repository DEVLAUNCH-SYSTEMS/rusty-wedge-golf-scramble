import { describe, expect, it } from "vitest";

import {
  formatInternalTeamName,
  isUniqueConstraintError,
  TEAM_NUMBER_ALLOCATION_MAX_RETRIES,
} from "@/lib/services/team-number-allocate";

describe("team number allocation helpers", () => {
  it("formats internal team names from teamNumber only", () => {
    expect(formatInternalTeamName(1)).toBe("Team #1");
    expect(formatInternalTeamName(14)).toBe("Team #14");
  });

  it("detects postgres unique constraint violations", () => {
    const error = Object.assign(new Error("duplicate key"), { code: "23505" });
    expect(isUniqueConstraintError(error)).toBe(true);
    expect(isUniqueConstraintError(new Error("teams_tournament_number_unique"))).toBe(
      true,
    );
    expect(isUniqueConstraintError(new Error("connection timeout"))).toBe(false);
  });

  it("retries up to the configured allocation attempt limit", () => {
    expect(TEAM_NUMBER_ALLOCATION_MAX_RETRIES).toBeGreaterThanOrEqual(3);
  });
});
