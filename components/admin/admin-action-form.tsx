"use client";

import { AdminActionFormBody } from "@/components/admin/admin-action-form-body";
import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { adminSectionTitleClassName } from "@/components/admin/admin-text-styles";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";

import type { ActionResult } from "@/lib/actions/action-result";

type FormMessage = { tone: "success" | "error"; text: string };

type AdminActionFormProps = {
  title: string;
  submitLabel: string;
  pendingLabel: string;
  danger?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  onSubmit: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
};

function resolveDisplayMessage(
  disabled: boolean,
  disabledMessage: string | undefined,
  message: FormMessage | null,
): FormMessage | null {
  if (!disabled) return message;
  return {
    tone: "error",
    text:
      disabledMessage ??
      "This action is unavailable for the current tournament.",
  };
}

export function AdminActionForm(props: AdminActionFormProps) {
  const { message, isPending, runAction } = useAdminActionResult();
  const disabled = props.disabled ?? false;
  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>{props.title}</h2>
      <AdminActionFormBody
        disabled={disabled}
        danger={props.danger ?? false}
        isPending={isPending}
        submitLabel={props.submitLabel}
        pendingLabel={props.pendingLabel}
        displayMessage={resolveDisplayMessage(disabled, props.disabledMessage, message)}
        onSubmit={(formData) => {
          if (!disabled) runAction(() => props.onSubmit(formData));
        }}
      >
        {props.children}
      </AdminActionFormBody>
    </section>
  );
}
