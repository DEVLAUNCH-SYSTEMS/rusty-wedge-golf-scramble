import { deleteTournamentWithDependents } from "@/lib/services/integration-fixture-cleanup";

export async function deleteLifecycleTestTournament(
  tournamentId: string,
): Promise<void> {
  await deleteTournamentWithDependents(tournamentId);
}
