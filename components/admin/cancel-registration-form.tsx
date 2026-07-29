"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminTextAreaField } from "@/components/admin/admin-textarea-field";
import { cancelRegistrationAction } from "@/lib/actions/admin-registration";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type CancelRegistrationFormProps = {
  registrationId: string;
  disabled?: boolean;
  disabledMessage?: string;
};

export function CancelRegistrationForm({
  registrationId,
  disabled,
  disabledMessage,
}: CancelRegistrationFormProps) {
  return (
    <AdminActionForm
      title="Cancel registration"
      submitLabel="Cancel registration"
      pendingLabel="Cancelling…"
      danger
      disabled={disabled}
      disabledMessage={disabledMessage}
      onSubmit={(formData) => cancelRegistrationAction(registrationId, formData)}
    >
      <AdminTextAreaField
        name="adminNotes"
        label="Cancellation reason (required)"
        required
        maxLength={FIELD_LIMITS.adminNotes}
        placeholder="Refund issued, duplicate entry, player withdrew, etc."
      />
    </AdminActionForm>
  );
}
