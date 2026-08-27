import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { teams, tournaments } from "@/lib/db/schema";
import { formatAdminTeamLabel } from "@/lib/format/team-display";
import { formatTeamRosterPreview } from "@/lib/format/team-roster-display";
import { listTeamsForAdmin } from "@/lib/services/admin-teams-list";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import {
  assignPlayerToTeam,
  createTeam,
} from "@/lib/services/teams-mutations";

import {
  createTestAdminSession,
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

const createdTournamentIds: string[] = [];

function isAscendingNumeric(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1]! < value);
}

function isDescendingNumeric(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1]! > value);
}

function mockActiveTournamentContext() {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(null);
}

async function insertIsolatedSortTestTournament(): Promise<string> {
  const db = getDb();
  const tournament = (
    await db
      .insert(tournaments)
      .values({
        name: "Admin Teams Sort Test",
        slug: `admin-teams-sort-${randomUUID()}`,
        year: 2097,
        eventDate: "2097-06-01",
        locationName: "Sort Test Course",
        venmoHandle: "@sorttest",
        registrationEnabled: false,
        isActive: false,
        lifecycleStatus: "registration_closed",
      })
      .returning({ id: tournaments.id })
  )[0];

  if (!tournament) {
    throw new Error("Unable to insert sort test tournament.");
  }

  createdTournamentIds.push(tournament.id);

  await db.insert(teams).values([
    { tournamentId: tournament.id, teamNumber: 10, name: "Team #10" },
    { tournamentId: tournament.id, teamNumber: 2, name: "Team #2" },
  ]);

  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(tournament.id);

  return tournament.id;
}

afterEach(async () => {
  vi.restoreAllMocks();

  const db = getDb();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db.delete(teams).where(eq(teams.tournamentId, tournamentId));
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }
});

describe.skipIf(!hasIntegrationDatabase())("admin teams list sort integration", () => {
  it("orders teams by teamNumber ascending and descending numerically", async () => {
    await insertIsolatedSortTestTournament();

    const asc = await listTeamsForAdmin("asc");
    const ascNumbers = asc.map((team) => team.teamNumber!);

    expect(ascNumbers).toEqual([2, 10]);
    expect(isAscendingNumeric(ascNumbers)).toBe(true);

    const desc = await listTeamsForAdmin("desc");
    const descNumbers = desc.map((team) => team.teamNumber!);

    expect(descNumbers).toEqual([10, 2]);
    expect(isDescendingNumeric(descNumbers)).toBe(true);
  });

  it("labels teams as Team #N and maps roster preview from memberships", async () => {
    mockActiveTournamentContext();

    const admin = await createTestAdminSession();
    const tournamentId = await getActiveTournamentId();
    const team = await createTeam(admin);
    const player = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("roster-preview"),
      registrationStatus: "confirmed",
    });

    await assignPlayerToTeam(team.id, player!.id, admin);

    const listed = (await listTeamsForAdmin("asc")).find((row) => row.id === team.id);

    expect(listed).toBeDefined();
    expect(formatAdminTeamLabel(listed!)).toBe(`Team #${team.teamNumber}`);
    expect(listed!.rosterMembers).toEqual([{ firstName: "Test", lastName: "Player" }]);
    expect(formatTeamRosterPreview(listed!.rosterMembers)).toBe("Test Player");

    const emptyTeam = (await listTeamsForAdmin("asc")).find(
      (row) => row.id !== team.id && row.rosterMembers.length === 0,
    );

    expect(emptyTeam).toBeDefined();
    expect(emptyTeam!.rosterMembers).toEqual([]);
  });

  it("keeps numeric ascending order across the full active tournament list", async () => {
    mockActiveTournamentContext();

    const rows = await listTeamsForAdmin("asc");
    const numbers = rows
      .map((team) => team.teamNumber)
      .filter((value): value is number => value != null);

    expect(numbers.length).toBeGreaterThan(1);
    expect(isAscendingNumeric(numbers)).toBe(true);
  });
});
