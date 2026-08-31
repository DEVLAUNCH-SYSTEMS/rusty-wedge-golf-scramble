import { describe, expect, it } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { assignPlayerToTeam } from "@/lib/services/teams-mutations";

import {
  createIntegrationTeam,
  createTestAdminSession,
  insertRegistrationRow,
  snapshotActiveTournament,
  uniqueTestEmail,
} from "./helpers";

describe.skipIf(!hasIntegrationDatabase())("team assignment integration", () => {
  it("H8: only confirmed players can be assigned to teams", async () => {
    const tournamentId = await snapshotActiveTournament();
    const admin = await createTestAdminSession();
    const team = await createIntegrationTeam(admin);
    const pending = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("pending-team"),
      registrationStatus: "pending_review",
    });

    await expect(
      assignPlayerToTeam(team.id, pending!.id, admin),
    ).rejects.toMatchObject({ code: "NOT_CONFIRMED" });
  });

  it("H9: teams cannot exceed four players", async () => {
    const tournamentId = await snapshotActiveTournament();
    const admin = await createTestAdminSession();
    const team = await createIntegrationTeam(admin);

    for (let index = 0; index < 4; index += 1) {
      const player = await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail(`team-slot-${index}`),
        registrationStatus: "confirmed",
      });

      await assignPlayerToTeam(team.id, player!.id, admin);
    }

    const overflow = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("team-overflow"),
      registrationStatus: "confirmed",
    });

    await expect(
      assignPlayerToTeam(team.id, overflow!.id, admin),
    ).rejects.toMatchObject({ code: "TEAM_FULL" });
  });
});
