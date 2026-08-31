import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { TeamsAdminPanels } from "@/components/admin/teams-admin-panels";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { resolveFinishingPlacementMutationReason } from "@/lib/content/finishing-placement-mutation-reason";
import {
  listAssignablePlayersForTeam,
  listTeamsForAdmin,
} from "@/lib/services/admin-teams-list";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { getTeamAssignmentReport } from "@/lib/services/team-assignment-report";

import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

async function loadTeamsPageData(sort: AdminTeamListSort) {
  const context = await resolveAdminTournamentContext();
  const [teams, report, unassignedPlayers] = await Promise.all([
    listTeamsForAdmin(sort),
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
    placementMutationReason: resolveFinishingPlacementMutationReason({
      lifecycleStatus: context.tournament.lifecycleStatus,
      isViewingActiveTournament: context.isViewingActiveTournament,
    }),
  };
}

export async function TeamsPageContent({ sort }: { sort: AdminTeamListSort }) {
  const pageData = await loadTeamsPageData(sort);

  return <TeamsAdminPanels sort={sort} {...pageData} />;
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
