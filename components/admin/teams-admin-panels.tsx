import { AdminExportLinks } from "@/components/admin/admin-export-links";
import { TeamsManagementPanels } from "@/components/admin/teams-management-panels";
import { TeamsOverviewPanels } from "@/components/admin/teams-overview-panels";
import { buildAdminExportHrefs } from "@/lib/services/admin-export-hrefs";

import type {
  AdminAssignablePlayer,
  AdminTeamListItem,
} from "@/lib/services/admin-teams-list";
import type { AdminTournamentContext } from "@/lib/services/admin-tournament-context";
import type { TeamAssignmentReport } from "@/lib/services/team-assignment-report";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export type TeamsAdminPanelsProps = {
  context: AdminTournamentContext;
  teams: AdminTeamListItem[];
  report: TeamAssignmentReport;
  unassignedPlayers: AdminAssignablePlayer[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
  placementMutationReason?: string;
};

export function TeamsAdminPanels(props: TeamsAdminPanelsProps) {
  return (
    <>
      <TeamsOverviewPanels
        context={props.context}
        report={props.report}
        readOnlyReason={props.readOnlyReason}
      />
      <TeamsManagementPanels
        teams={props.teams}
        unassignedPlayers={props.unassignedPlayers}
        sort={props.sort}
        readOnlyReason={props.readOnlyReason}
        placementMutationReason={props.placementMutationReason}
      />
      <AdminExportLinks hrefs={buildAdminExportHrefs(props.context)} />
    </>
  );
}
