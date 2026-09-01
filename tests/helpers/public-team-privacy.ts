import { expect } from "vitest";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

export function assertPublicTeamViewPrivacy(team: PublicTeamView): void {
  const allowedKeys = new Set([
    "players",
    "teamNumber",
    "finishingPlacement",
    "scoreRelativeToPar",
    "scoreTotalStrokes",
  ]);

  for (const key of Object.keys(team)) {
    expect(allowedKeys.has(key)).toBe(true);
  }

  const expectedKeys = ["players", "teamNumber"];

  if (team.finishingPlacement != null) {
    expectedKeys.push("finishingPlacement");
  }

  if (team.scoreRelativeToPar != null) {
    expectedKeys.push("scoreRelativeToPar");
  }

  if (team.scoreTotalStrokes != null) {
    expectedKeys.push("scoreTotalStrokes");
  }

  expect(Object.keys(team).sort()).toEqual(expectedKeys.sort());

  for (const player of team.players) {
    expect(Object.keys(player).sort()).toEqual(["firstName", "lastName"]);
  }
}
