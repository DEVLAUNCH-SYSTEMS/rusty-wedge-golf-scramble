import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import {
  teamsPublicationAcknowledgementCopy,
  teamsPublicationActionDescription,
} from "@/lib/content/teams-publication-copy";

type TeamsPublicationConfirmFieldsProps = {
  teamsPublished: boolean;
};

export function TeamsPublicationConfirmFields({
  teamsPublished,
}: TeamsPublicationConfirmFieldsProps) {
  return (
    <>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {teamsPublicationActionDescription(teamsPublished)}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="confirmAcknowledged"
          value="yes"
          required
          className="mt-1"
        />
        <span>{teamsPublicationAcknowledgementCopy(teamsPublished)}</span>
      </label>
    </>
  );
}
