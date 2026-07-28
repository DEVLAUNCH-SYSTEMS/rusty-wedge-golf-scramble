import { adminEmptyStateClassName } from "@/components/admin/admin-text-styles";
import { TournamentDesktopTable } from "@/components/admin/tournament-desktop-table";
import { TournamentListCards } from "@/components/admin/tournament-list-cards";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

export function TournamentListTable({
  tournaments,
}: {
  tournaments: AdminTournamentListItem[];
}) {
  if (tournaments.length === 0) {
    return (
      <p className={adminEmptyStateClassName}>No tournaments have been created yet.</p>
    );
  }

  return (
    <>
      <TournamentListCards tournaments={tournaments} />
      <TournamentDesktopTable tournaments={tournaments} />
    </>
  );
}
