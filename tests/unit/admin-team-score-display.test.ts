import { describe, expect, it } from "vitest";

import {
  ADMIN_TEAM_SCORE_EMPTY_LABEL,
  formatAdminTeamScoreDisplay,
} from "@/lib/format/admin-team-score-display";

describe("formatAdminTeamScoreDisplay", () => {
  it("formats combined relative and strokes scores", () => {
    expect(formatAdminTeamScoreDisplay(-8, 64)).toBe("-8 / 64");
    expect(formatAdminTeamScoreDisplay(0, 67)).toBe("E / 67");
    expect(formatAdminTeamScoreDisplay(2, 73)).toBe("+2 / 73");
  });

  it("formats partial scores without placeholders", () => {
    expect(formatAdminTeamScoreDisplay(-8, null)).toBe("-8");
    expect(formatAdminTeamScoreDisplay(0, null)).toBe("E");
    expect(formatAdminTeamScoreDisplay(2, null)).toBe("+2");
    expect(formatAdminTeamScoreDisplay(null, 64)).toBe("64");
  });

  it("uses the admin empty-value convention when both fields are absent", () => {
    expect(formatAdminTeamScoreDisplay(null, null)).toBe(ADMIN_TEAM_SCORE_EMPTY_LABEL);
  });
});
