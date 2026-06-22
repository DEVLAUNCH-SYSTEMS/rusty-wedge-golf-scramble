import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";

export type ActiveTournament = typeof tournaments.$inferSelect;

export async function getActiveTournament(): Promise<ActiveTournament | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.isActive, true))
    .limit(1);

  return rows[0] ?? null;
}

export async function requireActiveTournament(): Promise<ActiveTournament> {
  const tournament = await getActiveTournament();

  if (!tournament) {
    throw new ServiceError("NO_ACTIVE_TOURNAMENT", "No active tournament found.");
  }

  return tournament;
}

export function assertTournamentScope(
  tournamentId: string,
  activeTournamentId: string,
): void {
  if (tournamentId !== activeTournamentId) {
    throw new ServiceError(
      "TOURNAMENT_SCOPE_MISMATCH",
      "Record is outside the active tournament.",
    );
  }
}
