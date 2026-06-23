import { AdminTextAreaField } from "@/components/admin/admin-textarea-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type RegistrationNotesFieldsProps = {
  paymentReviewNotes: string | null;
  adminNotes: string | null;
};

export function RegistrationNotesFields({
  paymentReviewNotes,
  adminNotes,
}: RegistrationNotesFieldsProps) {
  return (
    <>
      <AdminTextAreaField
        name="paymentReviewNotes"
        label="Payment review notes"
        maxLength={FIELD_LIMITS.paymentReviewNotes}
        rows={4}
        defaultValue={paymentReviewNotes ?? ""}
      />
      <AdminTextAreaField
        name="adminNotes"
        label="Admin notes"
        maxLength={FIELD_LIMITS.adminNotes}
        rows={4}
        defaultValue={adminNotes ?? ""}
      />
    </>
  );
}
