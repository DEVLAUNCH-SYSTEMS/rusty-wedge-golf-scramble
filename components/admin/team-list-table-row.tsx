import { TeamListIdentity } from "@/components/admin/team-list-identity";
import { TeamListPlacementCell } from "@/components/admin/team-list-placement-cell";
import { TeamListTableDeleteAction } from "@/components/admin/team-list-table-delete-action";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

function TeamListCreatedCell({ createdAt }: { createdAt: Date }) {
  const label = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(createdAt);

  return (
    <td className="whitespace-nowrap px-4 py-3 align-top text-slate-600">{label}</td>
  );
}

export function TeamListRow({
  team,
  readOnlyReason,
  bulkEditMode = false,
}: {
  team: AdminTeamListItem;
  readOnlyReason?: string;
  bulkEditMode?: boolean;
}) {
  return (
    <tr className="hover:bg-rw-gray/60">
      <td className="px-4 py-3 align-top">
        <TeamListIdentity team={team} />
      </td>
      <td className="px-4 py-3 align-top text-rw-navy">{team.memberCount} / 4</td>
      <td className="px-4 py-3 align-top">
        <TeamListPlacementCell team={team} bulkEditMode={bulkEditMode} />
      </td>
      <TeamListCreatedCell createdAt={team.createdAt} />
      <td className="px-4 py-3 align-top">
        <TeamListTableDeleteAction team={team} readOnlyReason={readOnlyReason} />
      </td>
    </tr>
  );
}
