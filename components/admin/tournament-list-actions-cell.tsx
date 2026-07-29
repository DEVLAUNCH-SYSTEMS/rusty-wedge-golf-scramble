import { TournamentActivateControl } from "@/components/admin/tournament-activate-control";
import { TournamentLifecycleControls } from "@/components/admin/tournament-lifecycle-controls";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

export function TournamentListActionsCell({
  tournament,
}: {
  tournament: AdminTournamentListItem;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <TournamentActivateControl tournament={tournament} />
      <TournamentLifecycleControls tournament={tournament} />
    </div>
  );
}
