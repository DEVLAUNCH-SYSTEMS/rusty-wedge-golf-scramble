"use client";

import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { ResultsAnnouncementActionForm } from "@/components/admin/results-announcement-action-form";
import { verifyResultsAnnouncementSendAction } from "@/lib/actions/admin-results-announcement";
import { resultsAnnouncementVerifyDescription } from "@/lib/content/results-announcement-copy";

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

export function ResultsAnnouncementRecoveryForm(props: SharedFormProps) {
  return (
    <ResultsAnnouncementActionForm
      {...props}
      onSubmit={verifyResultsAnnouncementSendAction}
    >
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {resultsAnnouncementVerifyDescription()}
      </p>
    </ResultsAnnouncementActionForm>
  );
}
