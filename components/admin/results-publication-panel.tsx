import { ResultsPublicationForm } from "@/components/admin/results-publication-form";

export function ResultsPublicationPanel({
  resultsPublished,
  readOnlyReason,
}: {
  resultsPublished: boolean;
  readOnlyReason?: string;
}) {
  return (
    <ResultsPublicationForm
      resultsPublished={resultsPublished}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
  );
}
