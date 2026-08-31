import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers, teams } from "@/lib/db/schema";

export type PublicTeamPlayer = {
  firstName: string;
  lastName: string;
};

export type PublicTeamView = {
  teamNumber: number;
  players: PublicTeamPlayer[];
  finishingPlacement?: number;
};

export async function listPublicTeams(
  tournamentId: string,
): Promise<PublicTeamView[]> {
  const db = getDb();

  const teamRows = await db
    .select({ id: teams.id, teamNumber: teams.teamNumber })
    .from(teams)
    .where(eq(teams.tournamentId, tournamentId))
    .orderBy(asc(teams.teamNumber));

  if (teamRows.length === 0) {
    return [];
  }

  const rosterRows = await db
    .select({
      teamId: teamMembers.teamId,
      registrationId: teamMembers.registrationId,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
    })
    .from(teamMembers)
    .innerJoin(registrations, eq(registrations.id, teamMembers.registrationId))
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(
      and(
        eq(teams.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    )
    .orderBy(asc(registrations.lastName), asc(registrations.firstName));

  const playersByTeamId = new Map<string, PublicTeamPlayer[]>();
  const seenMemberships = new Set<string>();

  for (const row of rosterRows) {
    const membershipKey = `${row.teamId}:${row.registrationId}`;
    if (seenMemberships.has(membershipKey)) {
      continue;
    }

    seenMemberships.add(membershipKey);

    const players = playersByTeamId.get(row.teamId) ?? [];
    players.push({ firstName: row.firstName, lastName: row.lastName });
    playersByTeamId.set(row.teamId, players);
  }

  return teamRows.map((team) => ({
    teamNumber: team.teamNumber,
    players: playersByTeamId.get(team.id) ?? [],
  }));
}
