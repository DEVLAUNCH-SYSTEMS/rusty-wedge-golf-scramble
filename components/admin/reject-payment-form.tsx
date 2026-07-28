"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminTextAreaField } from "@/components/admin/admin-textarea-field";
import { rejectRegistrationPaymentAction } from "@/lib/actions/admin-registration";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type RejectPaymentFormProps = {
  registrationId: string;
  disabled?: boolean;
  disabledMessage?: string;
};

export function RejectPaymentForm({
  registrationId,
  disabled,
  disabledMessage,
}: RejectPaymentFormProps) {
  return (
    <AdminActionForm
      title="Reject payment"
      submitLabel="Reject payment"
      pendingLabel="Rejecting…"
      danger
      disabled={disabled}
      disabledMessage={disabledMessage}
      onSubmit={(formData) => rejectRegistrationPaymentAction(registrationId, formData)}
    >
      <AdminTextAreaField
        name="reason"
        label="Rejection reason"
        required
        maxLength={FIELD_LIMITS.rejectionReason}
      />
    </AdminActionForm>
  );
}
