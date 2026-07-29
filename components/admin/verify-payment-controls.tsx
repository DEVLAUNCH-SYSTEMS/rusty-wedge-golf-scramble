"use client";

import { adminButtonClassName } from "@/components/admin/admin-form-styles";
import { FormMessage } from "@/components/forms/form-message";

type FormMessageState = { tone: "success" | "error"; text: string };

export function VerifyPaymentControls(props: {
  disabled: boolean;
  isPending: boolean;
  displayMessage: FormMessageState | null;
  onVerify: () => void;
}) {
  return (
    <>
      <button
        type="button"
        disabled={props.disabled || props.isPending}
        className={`${adminButtonClassName} mt-4`}
        onClick={props.onVerify}
      >
        {props.isPending ? "Verifying…" : "Verify payment"}
      </button>
      {props.displayMessage ? (
        <div className="mt-4">
          <FormMessage tone={props.displayMessage.tone} message={props.displayMessage.text} />
        </div>
      ) : null}
    </>
  );
}
