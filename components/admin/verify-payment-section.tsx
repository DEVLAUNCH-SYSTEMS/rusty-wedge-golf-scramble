"use client";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminBodyTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import { VerifyPaymentControls } from "@/components/admin/verify-payment-controls";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { verifyRegistrationPaymentAction } from "@/lib/actions/admin-registration";

function archivedVerifyMessage(disabled: boolean, disabledMessage?: string) {
  return disabled && disabledMessage
    ? ({ tone: "error", text: disabledMessage } as const)
    : null;
}

export function VerifyPaymentSection(props: {
  registrationId: string;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const { message, isPending, runAction } = useAdminActionResult();
  const disabled = props.disabled ?? false;
  const displayMessage = archivedVerifyMessage(disabled, props.disabledMessage) ?? message;

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Verify payment</h2>
      <p className={`${adminBodyTextClassName} mt-2`}>
        Confirms the player if tournament capacity allows.
      </p>
      <VerifyPaymentControls
        disabled={disabled}
        isPending={isPending}
        displayMessage={displayMessage}
        onVerify={() => runAction(() => verifyRegistrationPaymentAction(props.registrationId))}
      />
    </section>
  );
}
