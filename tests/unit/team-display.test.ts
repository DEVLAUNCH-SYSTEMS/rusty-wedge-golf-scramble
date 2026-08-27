import { describe, expect, it } from "vitest";

import { formatAdminTeamLabel } from "@/lib/format/team-display";

describe("formatAdminTeamLabel", () => {
  it("prefers teamNumber when present", () => {
    expect(formatAdminTeamLabel({ teamNumber: 14, name: "Team #14- Legacy Label" })).toBe(
      "Team #14",
    );
  });

  it("falls back to legacy name when teamNumber is null", () => {
    expect(formatAdminTeamLabel({ teamNumber: null, name: "Integration Team A" })).toBe(
      "Integration Team A",
    );
  });
});
