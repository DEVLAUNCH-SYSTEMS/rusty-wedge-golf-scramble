import { describe, expect, it } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import {
  formatInternalTeamName,
  queryNextTeamNumber,
} from "@/lib/services/team-number-allocate";
import { createTeam } from "@/lib/services/teams-mutations";

import { createTestAdminSession, getActiveTournamentId } from "./helpers";

describe.skipIf(!hasIntegrationDatabase())("team create concurrency integration", () => {
  it("assigns distinct sequential team numbers under concurrent creates", async () => {
    const admin = await createTestAdminSession();
    const tournamentId = await getActiveTournamentId();
    const createCount = 6;
    const startingNumber = await queryNextTeamNumber(tournamentId);

    const created = await Promise.all(
      Array.from({ length: createCount }, () => createTeam(admin)),
    );

    const teamNumbers = created.map((team) => team.teamNumber).sort((a, b) => a - b);
    const expectedNumbers = Array.from(
      { length: createCount },
      (_, index) => startingNumber + index,
    );

    expect(new Set(teamNumbers).size).toBe(createCount);
    expect(teamNumbers).toEqual(expectedNumbers);

    for (const team of created) {
      expect(team.name).toBe(formatInternalTeamName(team.teamNumber));
    }
  });
});
