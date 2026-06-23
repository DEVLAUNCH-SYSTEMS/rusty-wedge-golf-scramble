import { and, count, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers } from "@/lib/db/schema";

export type TeamAssignmentReport = {
  confirmedCount: number;
  assignedCount: number;
  unassignedCount: number;
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
    .select({ total: count(sql`distinct ${teamMembers.registrationId}`) })
    .from(teamMembers)
    .innerJoin(registrations, eq(registrations.id, teamMembers.registrationId))
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    );

  const unassignedRows = await db
    .select({ total: count() })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
        isNull(teamMembers.id),
      ),
    );

  const confirmedCount = Number(confirmedRows[0]?.total ?? 0);
  const assignedCount = Number(assignedRows[0]?.total ?? 0);
  const unassignedCount = Number(unassignedRows[0]?.total ?? 0);

  return { confirmedCount, assignedCount, unassignedCount };
}
