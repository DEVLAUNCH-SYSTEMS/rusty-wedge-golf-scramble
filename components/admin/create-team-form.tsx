import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { createTeamAction } from "@/lib/actions/admin-teams";

function TeamNameField() {
  return (
    <label className={adminLabelClassName}>
      Team name
      <input
        type="text"
        name="name"
        required
        maxLength={100}
        className={adminInputClassName}
      />
    </label>
  );
}

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
      <TeamNameField />
    </AdminActionForm>
  );
}
