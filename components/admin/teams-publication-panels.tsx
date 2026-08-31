import { AdminSubsectionHeading } from "@/components/admin/admin-subsection-heading";
import { ResultsPublicationPanel } from "@/components/admin/results-publication-panel";
import { TeamsPublicationPanel } from "@/components/admin/teams-publication-panel";

export function TeamsPublicationPanels({
  teamsPublished,
  resultsPublished,
  readOnlyReason,
}: {
  teamsPublished: boolean;
  resultsPublished: boolean;
  readOnlyReason?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <AdminSubsectionHeading>Public visibility</AdminSubsectionHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TeamsPublicationPanel
          teamsPublished={teamsPublished}
          readOnlyReason={readOnlyReason}
        />
        <ResultsPublicationPanel
          resultsPublished={resultsPublished}
          readOnlyReason={readOnlyReason}
        />
      </div>
    </section>
  );
}
