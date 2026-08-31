import { AssignPlayerForm } from "@/components/admin/assign-player-form";

import type {
  AdminAssignablePlayer,
  AdminTeamDetail,
} from "@/lib/services/admin-teams-list";

export function TeamDetailAssignSection({
  team,
  assignablePlayers,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  assignablePlayers: AdminAssignablePlayer[];
  readOnlyReason?: string;
}) {
  if (team.slotsRemaining <= 0) {
    return null;
  }

  return (
    <AssignPlayerForm
      teamId={team.id}
      players={assignablePlayers}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
  );
}
