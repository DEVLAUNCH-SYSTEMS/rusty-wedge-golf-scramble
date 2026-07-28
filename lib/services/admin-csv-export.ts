import { requireAdminSession } from "@/lib/services/admin-auth";
import { requireAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import {
  exportRegistrationsCsvForTournament,
  exportTeamsCsvForTournament,
} from "@/lib/services/csv-export";
import { requireTournamentById } from "@/lib/services/tournament";

const CSV_HEADERS = {
  "Content-Type": "text/csv; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

async function resolveExportTournament(requestedTournamentId?: string | null) {
  if (requestedTournamentId) {
    return requireTournamentById(requestedTournamentId);
  }

  return requireAdminTournamentContext();
}

function csvFilename(prefix: string, year: number): string {
  return `${prefix}-${year}.csv`;
}

export async function buildRegistrationsCsvResponse(
  requestedTournamentId?: string | null,
): Promise<Response> {
  await requireAdminSession();
  const tournament = await resolveExportTournament(requestedTournamentId);
  const csv = await exportRegistrationsCsvForTournament(tournament.id);

  return new Response(csv, {
    status: 200,
    headers: {
      ...CSV_HEADERS,
      "Content-Disposition": `attachment; filename="${csvFilename("registrations", tournament.year)}"`,
    },
  });
}

export async function buildTeamsCsvResponse(
  requestedTournamentId?: string | null,
): Promise<Response> {
  await requireAdminSession();
  const tournament = await resolveExportTournament(requestedTournamentId);
  const csv = await exportTeamsCsvForTournament(tournament.id);

  return new Response(csv, {
    status: 200,
    headers: {
      ...CSV_HEADERS,
      "Content-Disposition": `attachment; filename="${csvFilename("teams", tournament.year)}"`,
    },
  });
}
