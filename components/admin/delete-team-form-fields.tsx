"use client";

import { AdminActionFormBody } from "@/components/admin/admin-action-form-body";
import { DeleteTeamConfirmFields } from "@/components/admin/delete-team-confirm-fields";
import {
  resolveDeleteTeamDisplayMessage,
  useDeleteTeamSubmit,
} from "@/hooks/use-delete-team-submit";

const denseDeleteFormClassName = "flex flex-col gap-3";

export type DeleteTeamFormFieldsProps = {
  teamId: string;
  teamLabel: string;
  memberCount: number;
  disabled?: boolean;
  disabledMessage?: string;
  dense?: boolean;
  redirectOnSuccess?: string;
};

export function DeleteTeamFormFields(props: DeleteTeamFormFieldsProps) {
  const { teamId, teamLabel, memberCount, disabled = false, disabledMessage, dense = false, redirectOnSuccess } =
    props;
  const { message, isPending, submitDelete } = useDeleteTeamSubmit(redirectOnSuccess);
  return (
    <AdminActionFormBody
      disabled={disabled}
      danger
      isPending={isPending}
      submitLabel="Delete team"
      pendingLabel="Deleting…"
      displayMessage={resolveDeleteTeamDisplayMessage(disabled, disabledMessage, message)}
      formClassName={dense ? denseDeleteFormClassName : undefined}
      onSubmit={(formData) => submitDelete(formData, disabled)}
    >
      <input type="hidden" name="teamId" value={teamId} />
      <DeleteTeamConfirmFields teamLabel={teamLabel} memberCount={memberCount} />
    </AdminActionFormBody>
  );
}
