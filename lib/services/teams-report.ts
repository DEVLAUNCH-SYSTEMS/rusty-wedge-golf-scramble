import { and, count, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers } from "@/lib/db/schema";

export type TeamAssignmentReport = {
  confirmedPlayers: number;
  assignedPlayers: number;
  unassignedPlayers: number;
};

export async function getTeamAssignmentReport(
  tournamentId: string,
): Promise<TeamAssignmentReport> {
  const db = getDb();
  const confirmedRows = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    );

  const assignedRows = await db
    .select({ total: count(teamMembers.id) })
    .from(teamMembers)
    .innerJoin(registrations, eq(teamMembers.registrationId, registrations.id))
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    );

  const confirmedPlayers = Number(confirmedRows[0]?.total ?? 0);
  const assignedPlayers = Number(assignedRows[0]?.total ?? 0);

  return {
    confirmedPlayers,
    assignedPlayers,
    unassignedPlayers: confirmedPlayers - assignedPlayers,
  };
}

export async function listUnassignedConfirmedPlayers(tournamentId: string) {
  const db = getDb();

  return db
    .select({
      id: registrations.id,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      skillLevel: registrations.skillLevel,
      preferredPlayers: registrations.preferredPlayers,
    })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
        isNull(teamMembers.id),
      ),
    );
}
