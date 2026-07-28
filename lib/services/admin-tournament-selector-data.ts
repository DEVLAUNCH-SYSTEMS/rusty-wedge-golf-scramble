import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { listTournamentsForAdmin } from "@/lib/services/admin-tournament-list";
import { getActiveTournament } from "@/lib/services/tournament";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

export type AdminTournamentSelectorData = {
  options: AdminTournamentListItem[];
  selectedTournamentId: string;
  activeTournamentId: string | null;
  isViewingActiveTournament: boolean;
};

export async function getAdminTournamentSelectorData(): Promise<AdminTournamentSelectorData> {
  const [options, context, active] = await Promise.all([
    listTournamentsForAdmin(),
    resolveAdminTournamentContext(),
    getActiveTournament(),
  ]);

  return {
    options,
    selectedTournamentId: context.tournament.id,
    activeTournamentId: active?.id ?? null,
    isViewingActiveTournament: context.isViewingActiveTournament,
  };
}
