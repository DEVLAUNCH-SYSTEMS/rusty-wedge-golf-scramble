import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import {
  deleteTeamAcknowledgementCopy,
  deleteTeamDescription,
} from "@/lib/content/delete-team-copy";

type DeleteTeamConfirmFieldsProps = {
  teamLabel: string;
  memberCount: number;
};

export function DeleteTeamConfirmFields({
  teamLabel,
  memberCount,
}: DeleteTeamConfirmFieldsProps) {
  return (
    <>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {deleteTeamDescription(teamLabel, memberCount)}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="confirmAcknowledged"
          value="yes"
          required
          className="mt-1"
        />
        <span>{deleteTeamAcknowledgementCopy(memberCount)}</span>
      </label>
    </>
  );
}
