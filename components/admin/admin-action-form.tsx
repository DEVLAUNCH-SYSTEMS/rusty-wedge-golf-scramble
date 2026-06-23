"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import {
  adminButtonClassName,
  adminCardClassName,
  adminDangerButtonClassName,
} from "@/components/admin/admin-form-styles";
import { adminSectionTitleClassName } from "@/components/admin/admin-text-styles";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";

import type { ActionResult } from "@/lib/actions/action-result";

type AdminActionFormProps = {
  title: string;
  submitLabel: string;
  pendingLabel: string;
  danger?: boolean;
  onSubmit: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
};

function ActionSubmitButton({
  danger,
  isPending,
  submitLabel,
  pendingLabel,
}: {
  danger: boolean;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
}) {
  const className = danger ? adminDangerButtonClassName : adminButtonClassName;

  return (
    <button type="submit" disabled={isPending} className={className}>
      {isPending ? pendingLabel : submitLabel}
    </button>
  );
}

export function AdminActionForm(props: AdminActionFormProps) {
  const { message, isPending, runAction } = useAdminActionResult();

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>{props.title}</h2>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          runAction(() => props.onSubmit(new FormData(event.currentTarget)));
        }}
      >
        {props.children}
        <ActionSubmitButton
          danger={props.danger ?? false}
          isPending={isPending}
          submitLabel={props.submitLabel}
          pendingLabel={props.pendingLabel}
        />
        <AdminActionMessage message={message} />
      </form>
    </section>
  );
}
