import { describe, expect, it } from "vitest";

import {
  sortAdminTeamsForDisplay,
} from "@/lib/services/admin-teams-list-order";

type SortFixtureTeam = {
  teamNumber: number;
  finishingPlacement: number | null;
  scoreRelativeToPar?: number | null;
  scoreTotalStrokes?: number | null;
};

function teamNumbers(items: SortFixtureTeam[]): number[] {
  return items.map((item) => item.teamNumber);
}

describe("sortAdminTeamsForDisplay", () => {
  it("keeps all-unplaced tournaments in team-number order", () => {
    const teams: SortFixtureTeam[] = [
      { teamNumber: 10, finishingPlacement: null },
      { teamNumber: 2, finishingPlacement: null },
      { teamNumber: 1, finishingPlacement: null },
    ];

    expect(teamNumbers(sortAdminTeamsForDisplay(teams, "asc"))).toEqual([1, 2, 10]);
    expect(teamNumbers(sortAdminTeamsForDisplay(teams, "desc"))).toEqual([10, 2, 1]);
  });

  it("sorts placed teams before unplaced teams", () => {
    const teams: SortFixtureTeam[] = [
      { teamNumber: 1, finishingPlacement: null },
      { teamNumber: 8, finishingPlacement: 1 },
      { teamNumber: 2, finishingPlacement: null },
    ];

    expect(teamNumbers(sortAdminTeamsForDisplay(teams))).toEqual([8, 1, 2]);
  });

  it("orders placed teams by placement ascending with team-number tie breaks", () => {
    const teams: SortFixtureTeam[] = [
      { teamNumber: 3, finishingPlacement: 3 },
      { teamNumber: 11, finishingPlacement: 2 },
      { teamNumber: 8, finishingPlacement: 1 },
      { teamNumber: 4, finishingPlacement: 2 },
    ];

    expect(teamNumbers(sortAdminTeamsForDisplay(teams))).toEqual([8, 4, 11, 3]);
  });

  it("orders unplaced teams by team number ascending after placed teams", () => {
    const teams: SortFixtureTeam[] = [
      { teamNumber: 2, finishingPlacement: null },
      { teamNumber: 8, finishingPlacement: 1 },
      { teamNumber: 1, finishingPlacement: null },
      { teamNumber: 4, finishingPlacement: 2 },
      { teamNumber: 11, finishingPlacement: 2 },
      { teamNumber: 3, finishingPlacement: 3 },
    ];

    expect(teamNumbers(sortAdminTeamsForDisplay(teams))).toEqual([8, 4, 11, 3, 1, 2]);
  });

  it("does not use score values for ordering", () => {
    const teams: SortFixtureTeam[] = [
      {
        teamNumber: 2,
        finishingPlacement: 1,
        scoreRelativeToPar: 5,
        scoreTotalStrokes: 80,
      },
      {
        teamNumber: 1,
        finishingPlacement: 1,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      },
    ];

    expect(teamNumbers(sortAdminTeamsForDisplay(teams))).toEqual([1, 2]);
  });
});
