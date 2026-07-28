import type { AdminTournamentContext } from "@/lib/services/admin-tournament-context";
import type { Tournament } from "@/lib/services/tournament";

export type AdminExportHrefs = {
  registrations: string;
  teams: string;
};

type ExportHrefContext = Pick<AdminTournamentContext, "isViewingActiveTournament"> & {
  tournament: Pick<Tournament, "id">;
};

export function buildAdminExportHrefs(context: ExportHrefContext): AdminExportHrefs {
  if (context.isViewingActiveTournament) {
    return {
      registrations: "/api/admin/export/registrations",
      teams: "/api/admin/export/teams",
    };
  }

  const query = `?tournamentId=${encodeURIComponent(context.tournament.id)}`;

  return {
    registrations: `/api/admin/export/registrations${query}`,
    teams: `/api/admin/export/teams${query}`,
  };
}
