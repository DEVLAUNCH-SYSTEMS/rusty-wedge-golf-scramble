import { AdminExportLinks } from "@/components/admin/admin-export-links";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { TeamAssignmentPanel } from "@/components/admin/team-assignment-panel";
import { TeamsManagementPanels } from "@/components/admin/teams-management-panels";
import { TeamsPageContext } from "@/components/admin/teams-page-context";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { buildAdminExportHrefs } from "@/lib/services/admin-export-hrefs";
import {
  listAssignablePlayersForTeam,
  listTeamsForAdmin,
} from "@/lib/services/admin-teams-list";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { getTeamAssignmentReport } from "@/lib/services/team-assignment-report";

async function loadTeamsPageData() {
  const context = await resolveAdminTournamentContext();
  const [teams, report, unassignedPlayers] = await Promise.all([
    listTeamsForAdmin(),
    getTeamAssignmentReport(context.tournament.id),
    listAssignablePlayersForTeam(),
  ]);

  return {
    context,
    teams,
    report,
    unassignedPlayers,
    readOnlyReason: adminViewReadOnlyReason(
      context.tournament.lifecycleStatus,
      context.isViewingActiveTournament,
    ),
  };
}

export async function TeamsPageContent() {
  const { context, teams, unassignedPlayers, report, readOnlyReason } =
    await loadTeamsPageData();

  return (
    <>
      <TeamsPageContext
        tournamentYear={context.tournament.year}
        lifecycleStatus={context.tournament.lifecycleStatus}
        isViewingActiveTournament={context.isViewingActiveTournament}
      />
      <TeamAssignmentPanel report={report} />
      <TeamsManagementPanels
        teams={teams}
        unassignedPlayers={unassignedPlayers}
        readOnlyReason={readOnlyReason}
      />
      <AdminExportLinks hrefs={buildAdminExportHrefs(context)} />
    </>
  );
}

export function TeamsPageHeader() {
  return (
    <div>
      <h1 className={adminPageHeadingClassName}>Teams</h1>
      <p className={adminPageSubheadingClassName}>
        Create teams, track assignment progress, and assign confirmed players.
      </p>
    </div>
  );
}
