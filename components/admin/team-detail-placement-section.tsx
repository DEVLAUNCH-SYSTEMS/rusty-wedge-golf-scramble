import { TeamFinishingPlacementForm } from "@/components/admin/team-finishing-placement-form";

import type { AdminTeamDetail } from "@/lib/services/admin-teams-list";

export function TeamDetailPlacementSection({
  team,
  placementMutationReason,
}: {
  team: AdminTeamDetail;
  placementMutationReason?: string;
}) {
  return (
    <TeamFinishingPlacementForm
      teamId={team.id}
      finishingPlacement={team.finishingPlacement}
      disabled={Boolean(placementMutationReason)}
      disabledMessage={placementMutationReason}
    />
  );
}
