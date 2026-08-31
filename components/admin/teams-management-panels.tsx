import { TeamsManagementSection } from "@/components/admin/teams-management-section";
import { UnassignedPlayersPanel } from "@/components/admin/unassigned-players-panel";

import type { AdminAssignablePlayer, AdminTeamListItem } from "@/lib/services/admin-teams-list";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export type TeamsManagementPanelsProps = {
  teams: AdminTeamListItem[];
  unassignedPlayers: AdminAssignablePlayer[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
  placementMutationReason?: string;
};

export function TeamsManagementPanels(props: TeamsManagementPanelsProps) {
  return (
    <>
      <TeamsManagementSection
        teams={props.teams}
        sort={props.sort}
        readOnlyReason={props.readOnlyReason}
        placementMutationReason={props.placementMutationReason}
      />
      <UnassignedPlayersPanel players={props.unassignedPlayers} />
    </>
  );
}
