"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminActionSubmitButton } from "@/components/admin/admin-action-submit-button";

type FormMessage = { tone: "success" | "error"; text: string };

type AdminActionFormBodyProps = {
  disabled: boolean;
  danger: boolean;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  displayMessage: FormMessage | null;
  onSubmit: (formData: FormData) => void;
  children: React.ReactNode;
};

export function AdminActionFormBody(props: AdminActionFormBodyProps) {
  return (
    <form
      className="mt-4 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(new FormData(event.currentTarget));
      }}
    >
      <fieldset disabled={props.disabled} className="flex flex-col gap-4 border-0 p-0">
        {props.children}
      </fieldset>
      <AdminActionMessage message={props.displayMessage} />
      <AdminActionSubmitButton
        danger={props.danger}
        isPending={props.isPending}
        disabled={props.disabled}
        submitLabel={props.submitLabel}
        pendingLabel={props.pendingLabel}
      />
    </form>
  );
}
