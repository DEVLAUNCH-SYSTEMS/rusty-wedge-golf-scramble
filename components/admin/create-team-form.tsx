import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { createTeamAction } from "@/lib/actions/admin-teams";

export function CreateTeamForm() {
  return (
    <AdminActionForm
      title="Create team"
      submitLabel="Create team"
      pendingLabel="Creating…"
      onSubmit={createTeamAction}
    >
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
    </AdminActionForm>
  );
}
