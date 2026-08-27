"use client";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { adminSectionTitleClassName } from "@/components/admin/admin-text-styles";
import { DeleteTeamFormFields } from "@/components/admin/delete-team-form-fields";

type DeleteTeamFormProps = {
  teamId: string;
  teamLabel: string;
  memberCount: number;
  disabled?: boolean;
  disabledMessage?: string;
  compact?: boolean;
  dense?: boolean;
  redirectOnSuccess?: string;
};

export function DeleteTeamForm(props: DeleteTeamFormProps) {
  if (props.compact) {
    const panelClassName = props.dense
      ? "rounded-lg border border-slate-200 bg-rw-gray/40 p-2.5"
      : "rounded-lg border border-slate-200 bg-rw-gray/40 p-3";

    return (
      <div className={panelClassName}>
        <DeleteTeamFormFields {...props} />
      </div>
    );
  }

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Delete team</h2>
      <DeleteTeamFormFields {...props} />
    </section>
  );
}
