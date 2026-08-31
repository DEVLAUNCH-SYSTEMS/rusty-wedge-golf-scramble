import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { AdminMobileListField } from "@/components/admin/admin-mobile-list-field";
import { TeamListDeleteAction } from "@/components/admin/team-list-delete-action";
import { TeamListIdentity } from "@/components/admin/team-list-identity";
import { TeamListPlacementCell } from "@/components/admin/team-list-placement-cell";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value);
}

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
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AdminMobileListField label="Players">{team.memberCount} / 4</AdminMobileListField>
        <AdminMobileListField label="Place">
          <TeamListPlacementCell team={team} bulkEditMode={bulkEditMode} />
        </AdminMobileListField>
        <AdminMobileListField label="Created">{formatDate(team.createdAt)}</AdminMobileListField>
      </div>
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
