import { RejectPaymentForm } from "@/components/admin/reject-payment-form";
import { VerifyPaymentSection } from "@/components/admin/verify-payment-section";

type PaymentActionProps = {
  registrationId: string;
  canVerify: boolean;
  canReject: boolean;
  readOnlyReason?: string;
};

function VerifyPaymentAction({
  registrationId,
  readOnlyReason,
}: Pick<PaymentActionProps, "registrationId" | "readOnlyReason">) {
  return (
    <VerifyPaymentSection
      registrationId={registrationId}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
  );
}

export function RegistrationPaymentActions(props: PaymentActionProps) {
  if (!props.canVerify && !props.canReject) return null;

  return (
    <>
      {props.canVerify ? (
        <VerifyPaymentAction
          registrationId={props.registrationId}
          readOnlyReason={props.readOnlyReason}
        />
      ) : null}
      {props.canReject ? (
        <RejectPaymentForm
          registrationId={props.registrationId}
          disabled={Boolean(props.readOnlyReason)}
          disabledMessage={props.readOnlyReason}
        />
      ) : null}
    </>
  );
}
