import { listTournamentsForAdmin } from "@/lib/services/admin-tournament-list";
import { resolveCreateTournamentFormDefaults } from "@/lib/services/tournament-create-form-defaults";

export async function getCreateTournamentPageData(
  requestedCopyFromId: string | null,
) {
  const tournaments = await listTournamentsForAdmin();
  const selectedCopyFromId = tournaments.some(
    (row) => row.id === requestedCopyFromId,
  )
    ? requestedCopyFromId
    : null;

  return {
    defaults: await resolveCreateTournamentFormDefaults(
      tournaments,
      selectedCopyFromId,
    ),
    copySources: tournaments.map((row) => ({
      id: row.id,
      label: `${row.year} — ${row.name}`,
    })),
    selectedCopyFromId,
  };
}

export function readCopyFromSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.copyFrom;

  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  return value;
}
