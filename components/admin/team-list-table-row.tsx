import { BulkResultsScoreCells } from "@/components/admin/bulk-results-score-cells";
import { TeamListIdentity } from "@/components/admin/team-list-identity";
import { TeamListPlacementCell } from "@/components/admin/team-list-placement-cell";
import { TeamListScoreLabel } from "@/components/admin/team-list-score-label";
import { TeamListTableDeleteAction } from "@/components/admin/team-list-table-delete-action";
import { formatAdminTeamMemberCapacity } from "@/lib/format/admin-team-capacity-display";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

type TeamListRowProps = {
  team: AdminTeamListItem;
  readOnlyReason?: string;
  bulkEditMode?: boolean;
};

export function TeamListRow({ team, readOnlyReason, bulkEditMode = false }: TeamListRowProps) {
  return (
    <tr className="hover:bg-rw-gray/60">
      <td className="px-4 py-3 align-top">
        <TeamListIdentity team={team} />
      </td>
      <td className="px-4 py-3 align-top text-rw-navy">
        {formatAdminTeamMemberCapacity(team.memberCount)}
      </td>
      <td className="px-4 py-3 align-top">
        <TeamListPlacementCell team={team} bulkEditMode={bulkEditMode} />
      </td>
      {bulkEditMode ? (
        <BulkResultsScoreCells team={team} />
      ) : (
        <td className="px-4 py-3 align-top">
          <TeamListScoreLabel team={team} />
        </td>
      )}
      <td className="px-4 py-3 align-top">
        <TeamListTableDeleteAction team={team} readOnlyReason={readOnlyReason} />
      </td>
    </tr>
  );
}
