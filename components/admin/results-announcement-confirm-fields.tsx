import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import {
  resultsAnnouncementAcknowledgementCopy,
  resultsAnnouncementRecipientDescription,
} from "@/lib/content/results-announcement-copy";

export function ResultsAnnouncementConfirmFields({
  recipientCount,
}: {
  recipientCount: number;
}) {
  return (
    <>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {resultsAnnouncementRecipientDescription(recipientCount)}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="confirmAcknowledged"
          value="yes"
          required
          className="mt-1"
        />
        <span>{resultsAnnouncementAcknowledgementCopy(recipientCount)}</span>
      </label>
    </>
  );
}
