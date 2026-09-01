import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { teams } from "@/lib/db/schema";
import { formatAdminTeamLabel } from "@/lib/format/team-display";
import { formatTeamRosterPreview } from "@/lib/format/team-roster-display";
import { listTeamsForAdmin } from "@/lib/services/admin-teams-list";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { assignPlayerToTeam } from "@/lib/services/teams-mutations";

import {
  createIntegrationTeam,
  createTestAdminSession,
  insertDisposableTournament,
  insertRegistrationRow,
  uniqueTestEmail,
  withDisposableWritableActiveTournament,
} from "./helpers";

function isAscendingNumeric(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1]! < value);
}

function isDescendingNumeric(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1]! > value);
}

function mockAdminTournamentContext(tournamentId: string) {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(tournamentId);
}

async function insertIsolatedSortTestTournament(): Promise<string> {
  const db = getDb();
  const tournamentId = await insertDisposableTournament({
    name: "Admin Teams Sort Test",
    slugPrefix: "admin-teams-sort",
    year: 2097,
    eventDate: "2097-06-01",
    locationName: "Sort Test Course",
    venmoHandle: "@sorttest",
  });

  await db.insert(teams).values([
    { tournamentId, teamNumber: 1, name: "Team #1" },
    { tournamentId, teamNumber: 2, name: "Team #2" },
    { tournamentId, teamNumber: 10, name: "Team #10" },
  ]);

  mockAdminTournamentContext(tournamentId);

  return tournamentId;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe.skipIf(!hasIntegrationDatabase())("admin teams list sort integration", () => {
  it("orders teams by teamNumber ascending and descending numerically", async () => {
    await insertIsolatedSortTestTournament();

    const asc = await listTeamsForAdmin("asc");
    const ascNumbers = asc.map((team) => team.teamNumber!);

    expect(ascNumbers).toEqual([1, 2, 10]);
    expect(isAscendingNumeric(ascNumbers)).toBe(true);

    const desc = await listTeamsForAdmin("desc");
    const descNumbers = desc.map((team) => team.teamNumber!);

    expect(descNumbers).toEqual([10, 2, 1]);
    expect(isDescendingNumeric(descNumbers)).toBe(true);
  });

  it("labels teams as Team #N and maps roster preview from memberships", async () => {
    await withDisposableWritableActiveTournament(async (tournamentId) => {
      mockAdminTournamentContext(tournamentId);

      const admin = await createTestAdminSession();
      const populatedTeam = await createIntegrationTeam(admin);
      const emptyTeam = await createIntegrationTeam(admin);
      const player = await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("roster-preview"),
        registrationStatus: "confirmed",
      });

      await assignPlayerToTeam(populatedTeam.id, player!.id, admin);

      const listed = await listTeamsForAdmin("asc");
      const populatedRow = listed.find((row) => row.id === populatedTeam.id);
      const emptyRow = listed.find((row) => row.id === emptyTeam.id);

      expect(populatedRow).toBeDefined();
      expect(formatAdminTeamLabel(populatedRow!)).toBe(`Team #${populatedTeam.teamNumber}`);
      expect(populatedRow!.rosterMembers).toEqual([{ firstName: "Test", lastName: "Player" }]);
      expect(formatTeamRosterPreview(populatedRow!.rosterMembers)).toBe("Test Player");

      expect(emptyRow).toBeDefined();
      expect(emptyRow!.rosterMembers).toEqual([]);
    });
  });

  it("keeps numeric ascending order across the full active tournament list", async () => {
    await insertIsolatedSortTestTournament();

    const rows = await listTeamsForAdmin("asc");
    const numbers = rows
      .map((team) => team.teamNumber)
      .filter((value): value is number => value != null);

    expect(numbers.length).toBeGreaterThan(1);
    expect(numbers).toEqual([1, 2, 10]);
    expect(isAscendingNumeric(numbers)).toBe(true);
  });

  it("orders placed teams before unplaced teams by placement then team number", async () => {
    const db = getDb();
    const tournamentId = await insertDisposableTournament({
      name: "Admin Teams Placement Sort Test",
      slugPrefix: "admin-teams-placement-sort",
      year: 2097,
      eventDate: "2097-06-01",
      locationName: "Placement Sort Course",
      venmoHandle: "@placementsort",
    });

    await db.insert(teams).values([
      { tournamentId, teamNumber: 1, name: "Team #1", finishingPlacement: null },
      { tournamentId, teamNumber: 2, name: "Team #2", finishingPlacement: null },
      { tournamentId, teamNumber: 3, name: "Team #3", finishingPlacement: 3 },
      { tournamentId, teamNumber: 4, name: "Team #4", finishingPlacement: 2 },
      { tournamentId, teamNumber: 8, name: "Team #8", finishingPlacement: 1 },
      {
        tournamentId,
        teamNumber: 11,
        name: "Team #11",
        finishingPlacement: 2,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      },
    ]);

    mockAdminTournamentContext(tournamentId);

    const rows = await listTeamsForAdmin("asc");

    expect(rows.map((team) => team.teamNumber)).toEqual([8, 4, 11, 3, 1, 2]);
  });
});
