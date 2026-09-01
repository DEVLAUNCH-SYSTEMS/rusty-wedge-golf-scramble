"use client";

import { ResultsAnnouncementActionForm } from "@/components/admin/results-announcement-action-form";
import { ResultsAnnouncementConfirmFields } from "@/components/admin/results-announcement-confirm-fields";
import { sendResultsAnnouncementAction } from "@/lib/actions/admin-results-announcement";

import type { ResultsAnnouncementFormConfig } from "@/lib/content/results-announcement-panel-view";

type SharedFormProps = {
  formConfig: ResultsAnnouncementFormConfig;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
  statusDescription: string;
  recipientCount: number;
  disabled?: boolean;
  disabledMessage?: string;
};

export function ResultsAnnouncementSendForm(props: SharedFormProps) {
  return (
    <ResultsAnnouncementActionForm {...props} onSubmit={sendResultsAnnouncementAction}>
      <ResultsAnnouncementConfirmFields recipientCount={props.recipientCount} />
    </ResultsAnnouncementActionForm>
  );
}
