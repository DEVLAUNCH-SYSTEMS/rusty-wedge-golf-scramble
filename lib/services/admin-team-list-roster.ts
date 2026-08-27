import { asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers, teams } from "@/lib/db/schema";

import type { TeamRosterMember } from "@/lib/format/team-roster-display";

export async function loadTeamRosterMembersByTeamId(
  tournamentId: string,
): Promise<Map<string, TeamRosterMember[]>> {
  const db = getDb();
  const rows = await db
    .select({
      teamId: teamMembers.teamId,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
    })
    .from(teamMembers)
    .innerJoin(registrations, eq(registrations.id, teamMembers.registrationId))
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teams.tournamentId, tournamentId))
    .orderBy(asc(registrations.lastName), asc(registrations.firstName));

  const rosters = new Map<string, TeamRosterMember[]>();

  for (const row of rows) {
    const members = rosters.get(row.teamId) ?? [];
    members.push({ firstName: row.firstName, lastName: row.lastName });
    rosters.set(row.teamId, members);
  }

  return rosters;
}
