import { AdminMobileListField } from "@/components/admin/admin-mobile-list-field";
import { TeamListPlacementCell } from "@/components/admin/team-list-placement-cell";
import { TeamListScoreLabel } from "@/components/admin/team-list-score-label";
import { formatAdminTeamMemberCapacity } from "@/lib/format/admin-team-capacity-display";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

export function TeamListCardFields({
  team,
  bulkEditMode = false,
}: {
  team: AdminTeamListItem;
  bulkEditMode?: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <AdminMobileListField label="Players">
        {formatAdminTeamMemberCapacity(team.memberCount)}
      </AdminMobileListField>
      <AdminMobileListField label="Place">
        <TeamListPlacementCell team={team} bulkEditMode={bulkEditMode} />
      </AdminMobileListField>
      {!bulkEditMode ? (
        <AdminMobileListField label="Score">
          <TeamListScoreLabel team={team} />
        </AdminMobileListField>
      ) : null}
    </div>
  );
}
