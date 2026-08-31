import {
  adminMutedTextClassName,
} from "@/components/admin/admin-text-styles";
import { TeamsDesktopTable } from "@/components/admin/teams-desktop-table";
import { TeamsListCards } from "@/components/admin/teams-list-cards";
import { TeamsListSortToggle } from "@/components/admin/teams-list-sort-toggle";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export type TeamsListTableProps = {
  teams: AdminTeamListItem[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
  bulkEditMode?: boolean;
};

function TeamsBulkEditList(props: Pick<TeamsListTableProps, "teams" | "sort" | "readOnlyReason">) {
  return (
    <div className="flex flex-col gap-3">
      <TeamsListSortToggle sort={props.sort} disabled />
      <TeamsDesktopTable
        teams={props.teams}
        readOnlyReason={props.readOnlyReason}
        bulkEditMode
        shellClassName="block"
      />
    </div>
  );
}

function TeamsReadOnlyList(props: Pick<TeamsListTableProps, "teams" | "sort" | "readOnlyReason">) {
  const tableProps = {
    teams: props.teams,
    readOnlyReason: props.readOnlyReason,
    bulkEditMode: false as const,
  };

  return (
    <div className="flex flex-col gap-3">
      <TeamsListSortToggle sort={props.sort} />
      <TeamsListCards {...tableProps} />
      <p className={`${adminMutedTextClassName} min-[1100px]:hidden`}>
        Select a team to assign or remove confirmed players.
      </p>
      <TeamsDesktopTable {...tableProps} shellClassName="hidden min-[1100px]:block" />
    </div>
  );
}

export function TeamsListTable(props: TeamsListTableProps) {
  if (props.bulkEditMode) {
    return <TeamsBulkEditList teams={props.teams} sort={props.sort} readOnlyReason={props.readOnlyReason} />;
  }

  return <TeamsReadOnlyList teams={props.teams} sort={props.sort} readOnlyReason={props.readOnlyReason} />;
}
