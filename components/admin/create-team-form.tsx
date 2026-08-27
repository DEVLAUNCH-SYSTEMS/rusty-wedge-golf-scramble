"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { createTeamAction } from "@/lib/actions/admin-teams";

export function CreateTeamForm({
  disabled,
  disabledMessage,
}: {
  disabled?: boolean;
  disabledMessage?: string;
}) {
  return (
    <AdminActionForm
      title="Create team"
      submitLabel="Create team"
      pendingLabel="Creating…"
      disabled={disabled}
      disabledMessage={disabledMessage}
      onSubmit={createTeamAction}
    >
      <p className={`text-sm ${adminMutedTextClassName}`}>
        The next team number is assigned automatically.
      </p>
    </AdminActionForm>
  );
}
