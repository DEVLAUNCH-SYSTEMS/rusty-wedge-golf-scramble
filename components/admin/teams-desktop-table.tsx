import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
  adminMutedTextClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import { TeamListRow } from "@/components/admin/team-list-table-row";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

type TeamsDesktopTableProps = {
  teams: AdminTeamListItem[];
  readOnlyReason?: string;
  bulkEditMode?: boolean;
  shellClassName: string;
};

function TeamListTableBody({
  teams,
  readOnlyReason,
  bulkEditMode = false,
}: Pick<TeamsDesktopTableProps, "teams" | "readOnlyReason" | "bulkEditMode">) {
  return (
    <tbody className={`divide-y ${adminTableBorderClassName}`}>
      {teams.map((team) => (
        <TeamListRow
          key={team.id}
          team={team}
          readOnlyReason={readOnlyReason}
          bulkEditMode={bulkEditMode}
        />
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
        <th className="px-4 py-3 font-medium">Place</th>
        <th className="px-4 py-3 font-medium">Created</th>
        <th className="px-4 py-3 font-medium">Delete</th>
      </tr>
    </thead>
  );
}

export function TeamsDesktopTable({
  teams,
  readOnlyReason,
  bulkEditMode = false,
  shellClassName,
}: TeamsDesktopTableProps) {
  return (
    <AdminTableScrollShell className={shellClassName}>
      <table className={`min-w-[48rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <TeamListTableHead />
        <TeamListTableBody
          teams={teams}
          readOnlyReason={readOnlyReason}
          bulkEditMode={bulkEditMode}
        />
      </table>
      <p className={`${adminMutedTextClassName} px-4 py-3`}>
        Select a team to assign or remove confirmed players.
      </p>
    </AdminTableScrollShell>
  );
}
