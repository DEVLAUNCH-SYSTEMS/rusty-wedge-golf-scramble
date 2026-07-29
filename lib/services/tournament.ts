import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";
import {
  allowsAdminMutations,
  allowsPublicRegistration,
} from "@/lib/services/tournament-lifecycle";

export type Tournament = typeof tournaments.$inferSelect;
export type ActiveTournament = Tournament;
export type PublicCreateTournament = Pick<Tournament, "id" | "lifecycleStatus">;

export function isPublicRegistrationOpen(
  tournament: Pick<Tournament, "lifecycleStatus">,
): boolean {
  return allowsPublicRegistration(tournament.lifecycleStatus);
}

export async function getActiveTournament(): Promise<Tournament | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.isActive, true))
    .limit(1);

  return rows[0] ?? null;
}

export async function requireActiveTournament(): Promise<Tournament> {
  const tournament = await getActiveTournament();

  if (!tournament) {
    throw new ServiceError("NO_ACTIVE_TOURNAMENT", "No active tournament found.");
  }

  return tournament;
}

export async function getTournamentById(
  tournamentId: string,
): Promise<Tournament | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId))
    .limit(1);

  return rows[0] ?? null;
}

export async function requireTournamentById(
  tournamentId: string,
): Promise<Tournament> {
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw new ServiceError("TOURNAMENT_NOT_FOUND", "Tournament not found.");
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

export async function requireWritableActiveTournament(): Promise<Tournament> {
  const tournament = await requireActiveTournament();
  assertTournamentWritable(tournament);
  return tournament;
}

export function assertTournamentWritable(
  tournament: Pick<Tournament, "lifecycleStatus">,
): void {
  if (!allowsAdminMutations(tournament.lifecycleStatus)) {
    throw new ServiceError(
      "TOURNAMENT_ARCHIVED",
      "This tournament is archived and cannot be modified.",
    );
  }
}
