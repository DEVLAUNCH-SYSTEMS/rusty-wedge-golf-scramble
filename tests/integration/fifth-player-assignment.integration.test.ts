import { afterEach, describe, expect, it, vi } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { MAX_TEAM_SIZE } from "@/lib/domain/team-size";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { countTeamMembers } from "@/lib/services/team-scope";
import { assignPlayerToTeam } from "@/lib/services/teams-mutations";

import {
  createIntegrationTeam,
  createTestAdminSession,
  insertRegistrationRow,
  snapshotActiveTournament,
  uniqueTestEmail,
} from "./helpers";

function mockAdminTournamentContext(tournamentId: string) {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(tournamentId);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe.skipIf(!hasIntegrationDatabase())("fifth player assignment integration", () => {
  async function assignConfirmedPlayers(
    teamId: string,
    count: number,
    tournamentId: string,
    admin: Awaited<ReturnType<typeof createTestAdminSession>>,
  ) {
    for (let index = 0; index < count; index += 1) {
      const player = await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail(`fifth-player-slot-${index}`),
        registrationStatus: "confirmed",
      });

      await assignPlayerToTeam(teamId, player!.id, admin);
    }
  }

  it("allows assigning a fifth player and rejects a sixth", async () => {
    const tournamentId = await snapshotActiveTournament();
    mockAdminTournamentContext(tournamentId);
    const admin = await createTestAdminSession();
    const team = await createIntegrationTeam(admin);

    await assignConfirmedPlayers(team.id, MAX_TEAM_SIZE, tournamentId, admin);

    expect(await countTeamMembers(team.id)).toBe(5);

    const overflow = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("sixth-player-overflow"),
      registrationStatus: "confirmed",
    });

    await expect(
      assignPlayerToTeam(team.id, overflow!.id, admin),
    ).rejects.toMatchObject({ code: "TEAM_FULL" });
  });
});
