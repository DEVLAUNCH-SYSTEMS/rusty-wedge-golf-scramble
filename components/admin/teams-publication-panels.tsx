import { AdminSubsectionHeading } from "@/components/admin/admin-subsection-heading";
import { ResultsAnnouncementPanel } from "@/components/admin/results-announcement-panel";
import { ResultsAnnouncementSmokeTestPanel } from "@/components/admin/results-announcement-smoke-test-panel";
import { ResultsPublicationPanel } from "@/components/admin/results-publication-panel";
import { TeamsPublicationPanel } from "@/components/admin/teams-publication-panel";

import type { ResultsAnnouncementAdminView } from "@/lib/services/results-announcement-admin-view";

type TeamsPublicationPanelsProps = {
  teamsPublished: boolean;
  resultsPublished: boolean;
  readOnlyReason?: string;
  announcement: ResultsAnnouncementAdminView;
};

export function TeamsPublicationPanels(props: TeamsPublicationPanelsProps) {
  return (
    <section className="flex flex-col gap-3">
      <AdminSubsectionHeading>Public visibility</AdminSubsectionHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TeamsPublicationPanel
          teamsPublished={props.teamsPublished}
          readOnlyReason={props.readOnlyReason}
        />
        <ResultsPublicationPanel
          resultsPublished={props.resultsPublished}
          readOnlyReason={props.readOnlyReason}
        />
      </div>
      <ResultsAnnouncementPanel
        resultsPublished={props.resultsPublished}
        readOnlyReason={props.readOnlyReason}
        announcement={props.announcement}
      />
      {props.announcement.smokeTestEnabled ? <ResultsAnnouncementSmokeTestPanel /> : null}
    </section>
  );
}
