import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  resultsPublicationStatusDescription,
  resultsPublicationStatusLabel,
} from "@/lib/content/results-publication-copy";

export function resultsPublicationStatusTone(
  resultsPublished: boolean,
): "neutral" | "success" {
  return resultsPublished ? "success" : "neutral";
}

export function ResultsPublicationStatus({
  resultsPublished,
}: {
  resultsPublished: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge
        label={resultsPublicationStatusLabel(resultsPublished)}
        tone={resultsPublicationStatusTone(resultsPublished)}
      />
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {resultsPublicationStatusDescription(resultsPublished)}
      </p>
    </div>
  );
}
