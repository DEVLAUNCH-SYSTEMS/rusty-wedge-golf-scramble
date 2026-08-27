import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
  adminMutedTextClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import { TeamListIdentity } from "@/components/admin/team-list-identity";
import { TeamListTableDeleteAction } from "@/components/admin/team-list-table-delete-action";
import { TeamsListCards } from "@/components/admin/teams-list-cards";
import { TeamsListSortToggle } from "@/components/admin/teams-list-sort-toggle";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value);
}

function TeamListRow({
  team,
  readOnlyReason,
}: {
  team: AdminTeamListItem;
  readOnlyReason?: string;
}) {
  return (
    <tr className="hover:bg-rw-gray/60">
      <td className="px-4 py-3 align-top">
        <TeamListIdentity team={team} />
      </td>
      <td className="px-4 py-3 align-top text-rw-navy">{team.memberCount} / 4</td>
      <td className="whitespace-nowrap px-4 py-3 align-top text-slate-600">
        {formatDate(team.createdAt)}
      </td>
      <td className="px-4 py-3 align-top">
        <TeamListTableDeleteAction team={team} readOnlyReason={readOnlyReason} />
      </td>
    </tr>
  );
}

function TeamListTableBody({
  teams,
  readOnlyReason,
}: {
  teams: AdminTeamListItem[];
  readOnlyReason?: string;
}) {
  return (
    <tbody className={`divide-y ${adminTableBorderClassName}`}>
      {teams.map((team) => (
        <TeamListRow key={team.id} team={team} readOnlyReason={readOnlyReason} />
      ))}
    </tbody>
  );
}

function TeamListTableHead() {
  return (
    <thead className={adminTableHeadClassName}>
      <tr>
        <th className="px-4 py-3 font-medium">Team</th>
        <th className="px-4 py-3 font-medium">Players</th>
        <th className="px-4 py-3 font-medium">Created</th>
        <th className="px-4 py-3 font-medium">Delete</th>
      </tr>
    </thead>
  );
}

function TeamsDesktopTable({
  teams,
  readOnlyReason,
}: {
  teams: AdminTeamListItem[];
  readOnlyReason?: string;
}) {
  return (
    <AdminTableScrollShell className="hidden min-[1100px]:block">
      <table className={`min-w-[48rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <TeamListTableHead />
        <TeamListTableBody teams={teams} readOnlyReason={readOnlyReason} />
      </table>
      <p className={`${adminMutedTextClassName} px-4 py-3`}>
        Select a team to assign or remove confirmed players.
      </p>
    </AdminTableScrollShell>
  );
}

export function TeamsListTable({
  teams,
  sort,
  readOnlyReason,
}: {
  teams: AdminTeamListItem[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <TeamsListSortToggle sort={sort} />
      <TeamsListCards teams={teams} readOnlyReason={readOnlyReason} />
      <p className={`${adminMutedTextClassName} min-[1100px]:hidden`}>
        Select a team to assign or remove confirmed players.
      </p>
      <TeamsDesktopTable teams={teams} readOnlyReason={readOnlyReason} />
    </div>
  );
}
