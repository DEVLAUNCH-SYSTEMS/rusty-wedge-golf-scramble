import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

export function AdminTournamentSelectorOptions({
  options,
  activeTournamentId,
}: {
  options: AdminTournamentListItem[];
  activeTournamentId: string | null;
}) {
  return options.map((option) => (
    <option key={option.id} value={option.id}>
      {option.year} — {option.name}
      {option.id === activeTournamentId ? " (public active)" : ""}
    </option>
  ));
}
