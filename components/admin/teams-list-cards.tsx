import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { TeamListCardFields } from "@/components/admin/team-list-card-fields";
import { TeamListDeleteAction } from "@/components/admin/team-list-delete-action";
import { TeamListIdentity } from "@/components/admin/team-list-identity";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

function TeamListCard({
  team,
  readOnlyReason,
  bulkEditMode = false,
}: {
  team: AdminTeamListItem;
  readOnlyReason?: string;
  bulkEditMode?: boolean;
}) {
  return (
    <li className={`${adminCardClassName} list-none`}>
      <TeamListIdentity team={team} />
      <TeamListCardFields team={team} bulkEditMode={bulkEditMode} />
      <div className="mt-4">
        <TeamListDeleteAction team={team} readOnlyReason={readOnlyReason} />
      </div>
    </li>
  );
}

export function TeamsListCards({
  teams,
  readOnlyReason,
  bulkEditMode = false,
}: {
  teams: AdminTeamListItem[];
  readOnlyReason?: string;
  bulkEditMode?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-3 min-[1100px]:hidden">
      {teams.map((team) => (
        <TeamListCard
          key={team.id}
          team={team}
          readOnlyReason={readOnlyReason}
          bulkEditMode={bulkEditMode}
        />
      ))}
    </ul>
  );
}
