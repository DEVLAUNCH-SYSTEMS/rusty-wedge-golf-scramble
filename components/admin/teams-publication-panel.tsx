import { TeamsPublicationForm } from "@/components/admin/teams-publication-form";

export function TeamsPublicationPanel({
  teamsPublished,
  readOnlyReason,
}: {
  teamsPublished: boolean;
  readOnlyReason?: string;
}) {
  return (
    <TeamsPublicationForm
      teamsPublished={teamsPublished}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
  );
}
