import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import {
  resultsPublicationAcknowledgementCopy,
  resultsPublicationActionDescription,
} from "@/lib/content/results-publication-copy";

export function ResultsPublicationConfirmFields({
  resultsPublished,
}: {
  resultsPublished: boolean;
}) {
  return (
    <>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {resultsPublicationActionDescription(resultsPublished)}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="confirmAcknowledged"
          value="yes"
          required
          className="mt-1"
        />
        <span>{resultsPublicationAcknowledgementCopy(resultsPublished)}</span>
      </label>
    </>
  );
}
