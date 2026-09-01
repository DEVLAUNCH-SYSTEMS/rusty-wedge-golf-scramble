import { TeamAssignmentPanel } from "@/components/admin/team-assignment-panel";
import { TeamsPageContext } from "@/components/admin/teams-page-context";
import { TeamsPublicationPanels } from "@/components/admin/teams-publication-panels";

import type { AdminTournamentContext } from "@/lib/services/admin-tournament-context";
import type { ResultsAnnouncementAdminView } from "@/lib/services/results-announcement-admin-view";
import type { TeamAssignmentReport } from "@/lib/services/team-assignment-report";

type TeamsOverviewPanelsProps = {
  context: AdminTournamentContext;
  report: TeamAssignmentReport;
  readOnlyReason?: string;
  announcement: ResultsAnnouncementAdminView;
};

export function TeamsOverviewPanels(props: TeamsOverviewPanelsProps) {
  const { context, report, readOnlyReason, announcement } = props;

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
        announcement={announcement}
      />
    </>
  );
}
