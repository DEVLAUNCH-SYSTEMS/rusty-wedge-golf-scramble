"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { RegistrationNotesFields } from "@/components/admin/registration-notes-fields";
import { updateRegistrationNotesAction } from "@/lib/actions/admin-registration";

type UpdateNotesFormProps = {
  registrationId: string;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
};

export function UpdateNotesForm({
  registrationId,
  paymentReviewNotes,
  adminNotes,
}: UpdateNotesFormProps) {
  return (
    <AdminActionForm
      title="Admin notes"
      submitLabel="Save notes"
      pendingLabel="Saving…"
      onSubmit={(formData) => updateRegistrationNotesAction(registrationId, formData)}
    >
      <RegistrationNotesFields
        paymentReviewNotes={paymentReviewNotes}
        adminNotes={adminNotes}
      />
    </AdminActionForm>
  );
}
