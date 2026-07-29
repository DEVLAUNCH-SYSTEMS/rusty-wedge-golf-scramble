import { CancelRegistrationForm } from "@/components/admin/cancel-registration-form";

export function RegistrationCancelAction(props: {
  registrationId: string;
  canCancel: boolean;
  disabled: boolean;
  readOnlyReason?: string;
}) {
  if (!props.canCancel) {
    return null;
  }

  return (
    <CancelRegistrationForm
      registrationId={props.registrationId}
      disabled={props.disabled}
      disabledMessage={props.readOnlyReason}
    />
  );
}
