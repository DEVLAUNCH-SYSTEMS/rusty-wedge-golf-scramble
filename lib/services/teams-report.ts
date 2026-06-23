import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers } from "@/lib/db/schema";

export { getTeamAssignmentReport, type TeamAssignmentReport } from "@/lib/services/team-assignment-report";

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
