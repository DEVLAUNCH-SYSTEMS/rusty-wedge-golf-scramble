import { describe, expect, it } from "vitest";

import {
  formatPublicTeamResultsScoreLine,
  formatPublicTeamResultsScorePresentation,
} from "@/lib/format/public-team-results-score-display";

import { assertPublicTeamViewPrivacy } from "../helpers/public-team-privacy";

describe("formatPublicTeamResultsScoreLine", () => {
  it("formats combined relative and strokes scores", () => {
    expect(formatPublicTeamResultsScoreLine(-7, 64)).toBe("-7 / 64");
    expect(formatPublicTeamResultsScoreLine(0, 71)).toBe("E / 71");
    expect(formatPublicTeamResultsScoreLine(2, 73)).toBe("+2 / 73");
  });

  it("formats partial scores without placeholders", () => {
    expect(formatPublicTeamResultsScoreLine(-7, null)).toBe("-7");
    expect(formatPublicTeamResultsScoreLine(0, null)).toBe("E");
    expect(formatPublicTeamResultsScoreLine(2, null)).toBe("+2");
    expect(formatPublicTeamResultsScoreLine(null, 64)).toBe("64");
  });

  it("omits the score line when both fields are absent", () => {
    expect(formatPublicTeamResultsScoreLine(null, null)).toBeNull();
    expect(formatPublicTeamResultsScoreLine(undefined, undefined)).toBeNull();
  });
});

describe("formatPublicTeamResultsScorePresentation", () => {
  it("prefixes formatted scores with Score:", () => {
    expect(formatPublicTeamResultsScorePresentation(-7, 64)).toBe("Score: -7 / 64");
    expect(formatPublicTeamResultsScorePresentation(0, 71)).toBe("Score: E / 71");
    expect(formatPublicTeamResultsScorePresentation(2, 73)).toBe("Score: +2 / 73");
  });

  it("prefixes partial scores and omits the line when both fields are absent", () => {
    expect(formatPublicTeamResultsScorePresentation(-7, null)).toBe("Score: -7");
    expect(formatPublicTeamResultsScorePresentation(0, null)).toBe("Score: E");
    expect(formatPublicTeamResultsScorePresentation(2, null)).toBe("Score: +2");
    expect(formatPublicTeamResultsScorePresentation(null, 64)).toBe("Score: 64");
    expect(formatPublicTeamResultsScorePresentation(null, null)).toBeNull();
    expect(formatPublicTeamResultsScorePresentation(undefined, undefined)).toBeNull();
  });
});

describe("public results score privacy", () => {
  it("allows partial score fields on placed public teams", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 4,
      finishingPlacement: 2,
      scoreRelativeToPar: 0,
      players: [{ firstName: "Amy", lastName: "Smith" }],
    });

    assertPublicTeamViewPrivacy({
      teamNumber: 5,
      finishingPlacement: 3,
      scoreTotalStrokes: 72,
      players: [{ firstName: "Bo", lastName: "Jones" }],
    });
  });

  it("allows placement-only teams without score keys", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 6,
      finishingPlacement: 4,
      players: [{ firstName: "Cal", lastName: "Lee" }],
    });
  });
});
