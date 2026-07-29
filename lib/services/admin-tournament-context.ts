import { readAdminTournamentContextCookie } from "@/lib/services/admin-tournament-context-cookie";
import { ServiceError } from "@/lib/services/service-error";
import {
  getActiveTournament,
  getTournamentById,
  type Tournament,
} from "@/lib/services/tournament";

export type AdminTournamentContext = {
  tournament: Tournament;
  isViewingActiveTournament: boolean;
};

export async function resolveAdminTournamentContextForId(
  contextTournamentId: string | null | undefined,
): Promise<AdminTournamentContext> {
  const active = await getActiveTournament();

  if (contextTournamentId) {
    const selected = await getTournamentById(contextTournamentId);

    if (selected) {
      return {
        tournament: selected,
        isViewingActiveTournament: active?.id === selected.id,
      };
    }
  }

  if (active) {
    return { tournament: active, isViewingActiveTournament: true };
  }

  throw new ServiceError("NO_ACTIVE_TOURNAMENT", "No active tournament found.");
}

export async function resolveAdminTournamentContext(): Promise<AdminTournamentContext> {
  const contextId = await readAdminTournamentContextCookie();
  return resolveAdminTournamentContextForId(contextId);
}

export async function requireAdminTournamentContext(): Promise<Tournament> {
  const { tournament } = await resolveAdminTournamentContext();
  return tournament;
}
