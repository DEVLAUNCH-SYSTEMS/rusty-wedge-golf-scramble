"use client";

import { AdminTournamentSelectorField } from "@/components/admin/admin-tournament-selector-field";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { setAdminTournamentContextAction } from "@/lib/actions/admin-tournament-context";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

type AdminTournamentSelectorProps = {
  options: AdminTournamentListItem[];
  selectedTournamentId: string;
  activeTournamentId: string | null;
};

export function AdminTournamentSelector({
  options,
  selectedTournamentId,
  activeTournamentId,
}: AdminTournamentSelectorProps) {
  const { isPending, runAction } = useAdminActionResult();

  if (options.length === 0) {
    return null;
  }

  return (
    <AdminTournamentSelectorField
      options={options}
      selectedTournamentId={selectedTournamentId}
      activeTournamentId={activeTournamentId}
      disabled={isPending}
      onChange={(tournamentId) => {
        runAction(() => setAdminTournamentContextAction(tournamentId));
      }}
    />
  );
}
