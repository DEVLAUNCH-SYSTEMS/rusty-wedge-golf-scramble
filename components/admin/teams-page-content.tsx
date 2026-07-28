import { AdminExportLinks } from "@/components/admin/admin-export-links";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { ArchivedTournamentBanner } from "@/components/admin/archived-tournament-banner";
import { CreateTeamForm } from "@/components/admin/create-team-form";
import { TeamAssignmentPanel } from "@/components/admin/team-assignment-panel";
import { TeamsListTable } from "@/components/admin/teams-list-table";
import { UnassignedPlayersPanel } from "@/components/admin/unassigned-players-panel";
import { adminArchivedReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import {
  listAssignablePlayersForTeam,
  listTeamsForAdmin,
} from "@/lib/services/admin-teams-list";
import { getTeamAssignmentReport } from "@/lib/services/team-assignment-report";
import { requireActiveTournament } from "@/lib/services/tournament";

function TeamsManagementSection({
  readOnlyReason,
}: {
  readOnlyReason?: string;
}) {
  return (
    <CreateTeamForm
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
  );
}

export async function TeamsPageContent() {
  const tournament = await requireActiveTournament();
  const [teams, report, unassignedPlayers] = await Promise.all([
    listTeamsForAdmin(),
    getTeamAssignmentReport(tournament.id),
    listAssignablePlayersForTeam(),
  ]);
  const readOnlyReason = adminArchivedReadOnlyReason(tournament.lifecycleStatus);

  return (
    <>
      {readOnlyReason ? <ArchivedTournamentBanner /> : null}
      <TeamAssignmentPanel report={report} />
      <TeamsManagementSection readOnlyReason={readOnlyReason} />
      {teams.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
          No teams created yet.
        </p>
      ) : (
        <TeamsListTable teams={teams} />
      )}
      <UnassignedPlayersPanel players={unassignedPlayers} />
      <AdminExportLinks />
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
