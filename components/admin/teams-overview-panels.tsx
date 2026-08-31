import { TeamAssignmentPanel } from "@/components/admin/team-assignment-panel";
import { TeamsPageContext } from "@/components/admin/teams-page-context";
import { TeamsPublicationPanels } from "@/components/admin/teams-publication-panels";

import type { AdminTournamentContext } from "@/lib/services/admin-tournament-context";
import type { TeamAssignmentReport } from "@/lib/services/team-assignment-report";

export function TeamsOverviewPanels({
  context,
  report,
  readOnlyReason,
}: {
  context: AdminTournamentContext;
  report: TeamAssignmentReport;
  readOnlyReason?: string;
}) {
  return (
    <>
      <TeamsPageContext
        tournamentYear={context.tournament.year}
        lifecycleStatus={context.tournament.lifecycleStatus}
        isViewingActiveTournament={context.isViewingActiveTournament}
      />
      <TeamAssignmentPanel report={report} />
      <TeamsPublicationPanels
        teamsPublished={context.tournament.teamsPublished}
        resultsPublished={context.tournament.resultsPublished}
        readOnlyReason={readOnlyReason}
      />
    </>
  );
}
