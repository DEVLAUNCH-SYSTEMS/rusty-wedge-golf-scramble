"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { RegistrationNotesFields } from "@/components/admin/registration-notes-fields";
import { updateRegistrationNotesAction } from "@/lib/actions/admin-registration";

type UpdateNotesFormProps = {
  registrationId: string;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
  disabled?: boolean;
  disabledMessage?: string;
};

export function UpdateNotesForm({
  registrationId,
  paymentReviewNotes,
  adminNotes,
  disabled,
  disabledMessage,
}: UpdateNotesFormProps) {
  return (
    <AdminActionForm
      title="Admin notes"
      submitLabel="Save notes"
      pendingLabel="Saving…"
      disabled={disabled}
      disabledMessage={disabledMessage}
      onSubmit={(formData) => updateRegistrationNotesAction(registrationId, formData)}
    >
      <RegistrationNotesFields
        paymentReviewNotes={paymentReviewNotes}
        adminNotes={adminNotes}
      />
    </AdminActionForm>
  );
}
