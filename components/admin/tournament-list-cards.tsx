import { TournamentListCard } from "@/components/admin/tournament-list-card";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

export function TournamentListCards({
  tournaments,
}: {
  tournaments: AdminTournamentListItem[];
}) {
  return (
    <ul className="flex flex-col gap-3 min-[1100px]:hidden">
      {tournaments.map((tournament) => (
        <TournamentListCard key={tournament.id} tournament={tournament} />
      ))}
    </ul>
  );
}
