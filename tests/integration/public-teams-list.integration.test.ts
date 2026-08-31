import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { teams, tournaments } from "@/lib/db/schema";
import { formatPublicTeamLabel } from "@/lib/format/team-display";
import { formatTeamRosterMemberName } from "@/lib/format/team-roster-display";
import { listPublicTeams } from "@/lib/services/public-teams-list";
import { loadPublicTeamsPageData } from "@/lib/services/public-teams-page";
import { assignPlayerToTeam } from "@/lib/services/teams-mutations";
import { requireActiveTournament } from "@/lib/services/tournament";

import {
  createIntegrationTeam,
  createTestAdminSession,
  insertDisposableTournament,
  insertRegistrationRow,
  snapshotActiveTournament,
  uniqueTestEmail,
} from "./helpers";
import { assertPublicTeamViewPrivacy } from "../helpers/public-team-privacy";

function isAscendingNumeric(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1]! < value);
}

async function insertIsolatedPublicTeamsTournament(): Promise<string> {
  const db = getDb();
  const tournamentId = await insertDisposableTournament({
    name: "Public Teams List Test",
    slugPrefix: "public-teams-list",
    year: 2099,
    eventDate: "2099-06-01",
    locationName: "Public Test Course",
    venmoHandle: "@publicteams",
    teamsPublished: true,
  });

  await db.insert(teams).values([
    { tournamentId, teamNumber: 10, name: "Team #10" },
    { tournamentId, teamNumber: 2, name: "Team #2" },
    { tournamentId, teamNumber: 1, name: "Team #1" },
  ]);

  return tournamentId;
}

describe.skipIf(!hasIntegrationDatabase())("public teams list integration", () => {
  it("returns teams in numeric ascending order with Team #N identity", async () => {
    const tournamentId = await insertIsolatedPublicTeamsTournament();
    const listed = await listPublicTeams(tournamentId);
    const teamNumbers = listed.map((team) => team.teamNumber);

    expect(teamNumbers).toEqual([1, 2, 10]);
    expect(isAscendingNumeric(teamNumbers)).toBe(true);
    expect(formatPublicTeamLabel(listed[0]!.teamNumber)).toBe("Team #1");
  });

  it("maps confirmed roster members as First Last and excludes private fields", async () => {
    const admin = await createTestAdminSession();
    const tournamentId = await snapshotActiveTournament();
    const db = getDb();

    await db
      .update(tournaments)
      .set({ teamsPublished: true })
      .where(eq(tournaments.id, tournamentId));

    const team = await createIntegrationTeam(admin);
    const confirmed = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("public-confirmed"),
      registrationStatus: "confirmed",
    });

    await assignPlayerToTeam(team.id, confirmed!.id, admin);

    const listed = await listPublicTeams(tournamentId);
    const publishedTeam = listed.find((row) => row.teamNumber === team.teamNumber);

    expect(publishedTeam).toBeDefined();
    assertPublicTeamViewPrivacy(publishedTeam!);
    expect(publishedTeam!.players).toEqual([{ firstName: "Test", lastName: "Player" }]);
    expect(formatTeamRosterMemberName(publishedTeam!.players[0]!)).toBe("Test Player");
  });

  it("includes empty teams with no players", async () => {
    const tournamentId = await insertIsolatedPublicTeamsTournament();
    const listed = await listPublicTeams(tournamentId);

    expect(listed.every((team) => Array.isArray(team.players))).toBe(true);
    expect(listed.some((team) => team.players.length === 0)).toBe(true);
  });

  it("returns not_published for the active tournament without roster data", async () => {
    await snapshotActiveTournament();
    const active = await requireActiveTournament();

    const db = getDb();
    await db
      .update(tournaments)
      .set({ teamsPublished: false })
      .where(eq(tournaments.id, active.id));

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("not_published");
  });
});
