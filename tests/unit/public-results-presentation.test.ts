import { describe, expect, it } from "vitest";

import { PUBLIC_RESULTS_EMPTY_MESSAGE } from "@/lib/content/public-teams-copy";
import { formatPublicResultsPlacementHeading } from "@/lib/format/public-team-card-display";

import { assertPublicTeamViewPrivacy } from "../helpers/public-team-privacy";

describe("formatPublicResultsPlacementHeading", () => {
  it.each([
    [1, "1st Place"],
    [2, "2nd Place"],
    [3, "3rd Place"],
    [11, "11th Place"],
    [21, "21st Place"],
  ])("formats placement %i as %s", (placement, expected) => {
    expect(formatPublicResultsPlacementHeading(placement)).toBe(expected);
  });
});

describe("public results presentation", () => {
  it("allows finishingPlacement on the public team DTO in results mode", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 8,
      finishingPlacement: 1,
      players: [{ firstName: "Amy", lastName: "Smith" }],
    });
  });

  it("allows optional score fields on the public team DTO in results mode", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 8,
      finishingPlacement: 1,
      scoreRelativeToPar: -7,
      scoreTotalStrokes: 64,
      players: [{ firstName: "Amy", lastName: "Smith" }],
    });
  });

  it("uses bounded copy for published results with no placed teams", () => {
    expect(PUBLIC_RESULTS_EMPTY_MESSAGE).toContain("Placed teams will appear here");
  });
});
