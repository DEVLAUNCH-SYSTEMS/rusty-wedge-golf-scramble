"use client";

import {
  adminButtonClassName,
  adminCardClassName,
} from "@/components/admin/admin-form-styles";
import {
  adminBodyTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import { FormMessage } from "@/components/forms/form-message";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { verifyRegistrationPaymentAction } from "@/lib/actions/admin-registration";

type VerifyPaymentSectionProps = {
  registrationId: string;
};

export function VerifyPaymentSection({ registrationId }: VerifyPaymentSectionProps) {
  const { message, isPending, runAction } = useAdminActionResult();

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Verify payment</h2>
      <p className={`${adminBodyTextClassName} mt-2`}>
        Confirms the player if tournament capacity allows.
      </p>
      <button
        type="button"
        disabled={isPending}
        className={`${adminButtonClassName} mt-4`}
        onClick={() => runAction(() => verifyRegistrationPaymentAction(registrationId))}
      >
        {isPending ? "Verifying…" : "Verify payment"}
      </button>
      {message ? (
        <div className="mt-4">
          <FormMessage tone={message.tone} message={message.text} />
        </div>
      ) : null}
    </section>
  );
}
