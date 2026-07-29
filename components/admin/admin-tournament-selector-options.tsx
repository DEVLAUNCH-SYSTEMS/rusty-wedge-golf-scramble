import { lifecycleStatusLabel } from "@/lib/format/tournament-lifecycle-display";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

function adminTournamentSelectorOptionLabel(
  option: AdminTournamentListItem,
  activeTournamentId: string | null,
): string {
  const status = lifecycleStatusLabel(option.lifecycleStatus);
  const activeSuffix =
    option.id === activeTournamentId ? " · Public active" : "";

  return `${option.year} — ${status}${activeSuffix}`;
}

export function AdminTournamentSelectorOptions({
  options,
  activeTournamentId,
}: {
  options: AdminTournamentListItem[];
  activeTournamentId: string | null;
}) {
  return options.map((option) => (
    <option
      key={option.id}
      value={option.id}
      title={`${option.year} — ${option.name}`}
    >
      {adminTournamentSelectorOptionLabel(option, activeTournamentId)}
    </option>
  ));
}
