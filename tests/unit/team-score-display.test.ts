import { describe, expect, it } from "vitest";

import {
  formatScoreRelativeToPar,
  formatTeamScoreLine,
} from "@/lib/format/team-score-display";

describe("formatScoreRelativeToPar", () => {
  it("formats negative, even, and positive relative-to-par values", () => {
    expect(formatScoreRelativeToPar(-7)).toBe("-7");
    expect(formatScoreRelativeToPar(0)).toBe("E");
    expect(formatScoreRelativeToPar(2)).toBe("+2");
  });
});

describe("formatTeamScoreLine", () => {
  it("returns null when neither score field is set", () => {
    expect(formatTeamScoreLine(null, null)).toBeNull();
    expect(formatTeamScoreLine(undefined, undefined)).toBeNull();
  });

  it("formats combined relative and stroke lines", () => {
    expect(formatTeamScoreLine(-7, 64)).toBe("-7 / 64");
    expect(formatTeamScoreLine(0, 71)).toBe("E / 71");
    expect(formatTeamScoreLine(2, 73)).toBe("+2 / 73");
  });

  it("supports partial score display", () => {
    expect(formatTeamScoreLine(-7, null)).toBe("-7");
    expect(formatTeamScoreLine(0, null)).toBe("E");
    expect(formatTeamScoreLine(2, null)).toBe("+2");
    expect(formatTeamScoreLine(null, 64)).toBe("64");
  });
});
