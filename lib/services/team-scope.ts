import { count, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teamMembers, teams } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  assertTournamentWritable,
  requireActiveTournament,
} from "@/lib/services/tournament";

export async function countTeamMembers(teamId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ total: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return Number(rows[0]?.total ?? 0);
}

export async function requireWritableTeam(teamId: string) {
  const tournament = await requireActiveTournament();
  const db = getDb();
  const team = (
    await db.select().from(teams).where(eq(teams.id, teamId)).limit(1)
  )[0];

  if (!team) {
    throw new ServiceError("NOT_FOUND", "Team not found.");
  }

  assertTournamentScope(team.tournamentId, tournament.id);
  assertTournamentWritable(tournament);

  return { tournament, team };
}
