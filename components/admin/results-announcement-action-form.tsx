"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { ResultsAnnouncementStatus } from "@/components/admin/results-announcement-status";

import type { ActionResult } from "@/lib/actions/action-result";
import type { ResultsAnnouncementFormConfig } from "@/lib/content/results-announcement-panel-view";

type ResultsAnnouncementFormProps = {
  formConfig: ResultsAnnouncementFormConfig;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
  statusDescription: string;
  recipientCount: number;
  disabled?: boolean;
  disabledMessage?: string;
  onSubmit: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
};

export function ResultsAnnouncementActionForm(props: ResultsAnnouncementFormProps) {
  return (
    <AdminActionForm
      title="Results announcement email"
      submitLabel={props.formConfig.submitLabel}
      pendingLabel={props.formConfig.pendingLabel}
      disabled={props.disabled}
      disabledMessage={props.disabledMessage}
      onSubmit={props.onSubmit}
    >
      <ResultsAnnouncementStatus
        statusLabel={props.statusLabel}
        statusTone={props.statusTone}
        statusDescription={props.statusDescription}
        recipientCount={props.recipientCount}
      />
      {props.children}
    </AdminActionForm>
  );
}
