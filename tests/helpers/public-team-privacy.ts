import { expect } from "vitest";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

export function assertPublicTeamViewPrivacy(team: PublicTeamView): void {
  expect(Object.keys(team).sort()).toEqual(["players", "teamNumber"]);

  for (const player of team.players) {
    expect(Object.keys(player).sort()).toEqual(["firstName", "lastName"]);
  }
}
