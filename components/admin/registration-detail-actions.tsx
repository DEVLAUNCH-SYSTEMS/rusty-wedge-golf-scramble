import { RegistrationDetailActionsBody } from "@/components/admin/registration-detail-actions-body";

export function RegistrationDetailActions(props: {
  registrationId: string;
  registrationStatus: string;
  paymentStatus: string;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
  readOnlyReason?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <RegistrationDetailActionsBody
        registrationId={props.registrationId}
        canVerify={
          props.registrationStatus === "pending_review" &&
          props.paymentStatus === "submitted"
        }
        canReject={props.paymentStatus === "submitted"}
        canCancel={props.registrationStatus !== "cancelled"}
        paymentReviewNotes={props.paymentReviewNotes}
        adminNotes={props.adminNotes}
        readOnlyReason={props.readOnlyReason}
      />
    </div>
  );
}
