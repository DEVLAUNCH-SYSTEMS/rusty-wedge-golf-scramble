import { RegistrationAdminNotesSection } from "@/components/admin/registration-admin-notes-section";
import { RegistrationPaymentActions } from "@/components/admin/registration-payment-actions";

export function RegistrationDetailActionsBody(props: {
  registrationId: string;
  canVerify: boolean;
  canReject: boolean;
  canCancel: boolean;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
  readOnlyReason?: string;
}) {
  const shared = {
    registrationId: props.registrationId,
    readOnlyReason: props.readOnlyReason,
  };

  return (
    <>
      <RegistrationPaymentActions {...shared} canVerify={props.canVerify} canReject={props.canReject} />
      <RegistrationAdminNotesSection
        {...shared}
        paymentReviewNotes={props.paymentReviewNotes}
        adminNotes={props.adminNotes}
        canCancel={props.canCancel}
      />
    </>
  );
}
