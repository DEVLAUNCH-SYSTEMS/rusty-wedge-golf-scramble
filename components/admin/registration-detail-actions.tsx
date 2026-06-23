import { CancelRegistrationForm } from "@/components/admin/cancel-registration-form";
import { RejectPaymentForm } from "@/components/admin/reject-payment-form";
import { UpdateNotesForm } from "@/components/admin/update-notes-form";
import { VerifyPaymentSection } from "@/components/admin/verify-payment-section";

type RegistrationDetailActionsProps = {
  registrationId: string;
  registrationStatus: string;
  paymentStatus: string;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
};

export function RegistrationDetailActions({
  registrationId,
  registrationStatus,
  paymentStatus,
  paymentReviewNotes,
  adminNotes,
}: RegistrationDetailActionsProps) {
  const canVerify =
    registrationStatus === "pending_review" && paymentStatus === "submitted";
  const canReject = paymentStatus === "submitted";
  const canCancel = registrationStatus !== "cancelled";

  return (
    <div className="flex flex-col gap-6">
      {canVerify ? <VerifyPaymentSection registrationId={registrationId} /> : null}
      {canReject ? <RejectPaymentForm registrationId={registrationId} /> : null}
      <UpdateNotesForm
        registrationId={registrationId}
        paymentReviewNotes={paymentReviewNotes}
        adminNotes={adminNotes}
      />
      {canCancel ? <CancelRegistrationForm registrationId={registrationId} /> : null}
    </div>
  );
}
