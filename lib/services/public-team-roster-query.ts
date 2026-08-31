import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers, teams } from "@/lib/db/schema";

import type { PublicTeamPlayer } from "@/lib/services/public-teams-list";

type RosterRow = {
  teamId: string;
  registrationId: string;
  firstName: string;
  lastName: string;
};

function buildPlayersByTeamId(rows: RosterRow[]): Map<string, PublicTeamPlayer[]> {
  const playersByTeamId = new Map<string, PublicTeamPlayer[]>();
  const seenMemberships = new Set<string>();

  for (const row of rows) {
    const membershipKey = `${row.teamId}:${row.registrationId}`;
    if (seenMemberships.has(membershipKey)) {
      continue;
    }

    seenMemberships.add(membershipKey);

    const players = playersByTeamId.get(row.teamId) ?? [];
    players.push({ firstName: row.firstName, lastName: row.lastName });
    playersByTeamId.set(row.teamId, players);
  }

  return playersByTeamId;
}

async function loadConfirmedRosterRows(tournamentId: string): Promise<RosterRow[]> {
  const db = getDb();

  return db
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
}

export { buildPlayersByTeamId, loadConfirmedRosterRows };
