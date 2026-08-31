import { BulkPlacementRowInput } from "@/components/admin/bulk-placement-row-input";
import { TeamListPlacementLabel } from "@/components/admin/team-list-placement-label";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

export function TeamListPlacementCell({
  team,
  bulkEditMode = false,
}: {
  team: AdminTeamListItem;
  bulkEditMode?: boolean;
}) {
  if (bulkEditMode) {
    return (
      <BulkPlacementRowInput
        teamId={team.id}
        teamNumber={team.teamNumber}
        finishingPlacement={team.finishingPlacement}
      />
    );
  }

  return <TeamListPlacementLabel finishingPlacement={team.finishingPlacement} />;
}
