import { and, asc, eq, isNotNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import {
  buildPlayersByTeamId,
  loadConfirmedRosterRows,
} from "@/lib/services/public-team-roster-query";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

export async function listPublicResults(
  tournamentId: string,
): Promise<PublicTeamView[]> {
  const db = getDb();

  const teamRows = await db
    .select({
      id: teams.id,
      teamNumber: teams.teamNumber,
      finishingPlacement: teams.finishingPlacement,
      scoreRelativeToPar: teams.scoreRelativeToPar,
      scoreTotalStrokes: teams.scoreTotalStrokes,
    })
    .from(teams)
    .where(
      and(
        eq(teams.tournamentId, tournamentId),
        isNotNull(teams.finishingPlacement),
      ),
    )
    .orderBy(asc(teams.finishingPlacement), asc(teams.teamNumber));

  if (teamRows.length === 0) {
    return [];
  }

  const rosterRows = await loadConfirmedRosterRows(tournamentId);
  const placedTeamIds = new Set(teamRows.map((team) => team.id));
  const placedRosterRows = rosterRows.filter((row) => placedTeamIds.has(row.teamId));
  const playersByTeamId = buildPlayersByTeamId(placedRosterRows);

  return teamRows.map((team) => ({
    teamNumber: team.teamNumber,
    finishingPlacement: team.finishingPlacement ?? undefined,
    scoreRelativeToPar: team.scoreRelativeToPar ?? undefined,
    scoreTotalStrokes: team.scoreTotalStrokes ?? undefined,
    players: playersByTeamId.get(team.id) ?? [],
  }));
}
