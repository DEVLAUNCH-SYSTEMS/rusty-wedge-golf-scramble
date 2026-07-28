"use client";

import { TeamMemberRemoveControl } from "@/components/admin/team-member-remove-control";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { removePlayerFromTeamAction } from "@/lib/actions/admin-teams";

export function TeamMemberRemoveButton(props: {
  teamId: string;
  registrationId: string;
  playerName: string;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const { message, isPending, runAction } = useAdminActionResult();
  const disabled = props.disabled ?? false;
  const displayMessage =
    disabled && props.disabledMessage
      ? { tone: "error" as const, text: props.disabledMessage }
      : message;

  return (
    <TeamMemberRemoveControl
      playerName={props.playerName}
      disabled={disabled}
      isPending={isPending}
      message={displayMessage}
      onRemove={() =>
        runAction(() => removePlayerFromTeamAction(props.teamId, props.registrationId))
      }
    />
  );
}
