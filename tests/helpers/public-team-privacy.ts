import { expect } from "vitest";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

export function assertPublicTeamViewPrivacy(team: PublicTeamView): void {
  const allowedKeys = new Set(["players", "teamNumber", "finishingPlacement"]);

  for (const key of Object.keys(team)) {
    expect(allowedKeys.has(key)).toBe(true);
  }

  expect(Object.keys(team).sort()).toEqual(
    team.finishingPlacement == null
      ? ["players", "teamNumber"]
      : ["finishingPlacement", "players", "teamNumber"],
  );

  for (const player of team.players) {
    expect(Object.keys(player).sort()).toEqual(["firstName", "lastName"]);
  }
}
