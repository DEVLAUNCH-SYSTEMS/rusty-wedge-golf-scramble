"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { adminDangerButtonClassName } from "@/components/admin/admin-form-styles";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { removePlayerFromTeamAction } from "@/lib/actions/admin-teams";

type TeamMemberRemoveButtonProps = {
  teamId: string;
  registrationId: string;
  playerName: string;
};

export function TeamMemberRemoveButton({
  teamId,
  registrationId,
  playerName,
}: TeamMemberRemoveButtonProps) {
  const { message, isPending, runAction } = useAdminActionResult();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={isPending}
        className={adminDangerButtonClassName}
        onClick={() =>
          runAction(() => removePlayerFromTeamAction(teamId, registrationId))
        }
      >
        {isPending ? "Removing…" : `Remove ${playerName}`}
      </button>
      <AdminActionMessage message={message} />
    </div>
  );
}
