import { RegistrationCancelAction } from "@/components/admin/registration-cancel-action";
import { UpdateNotesForm } from "@/components/admin/update-notes-form";

export function RegistrationAdminNotesSection(props: {
  registrationId: string;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
  canCancel: boolean;
  readOnlyReason?: string;
}) {
  const formProps = {
    registrationId: props.registrationId,
    disabled: Boolean(props.readOnlyReason),
    disabledMessage: props.readOnlyReason,
  };

  return (
    <>
      <UpdateNotesForm
        {...formProps}
        paymentReviewNotes={props.paymentReviewNotes}
        adminNotes={props.adminNotes}
      />
      <RegistrationCancelAction {...formProps} canCancel={props.canCancel} />
    </>
  );
}
