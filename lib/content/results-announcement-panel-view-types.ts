import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";
import type { ResultsAnnouncementPartialDelivery } from "@/lib/services/results-announcement-admin-view";

export type ResultsAnnouncementPanelMode = "send" | "recovery" | "readonly";

export type ResultsAnnouncementFormConfig = {
  submitLabel: string;
  pendingLabel: string;
};

export type ResultsAnnouncementPanelView = {
  mode: ResultsAnnouncementPanelMode;
  disabled: boolean;
  disabledMessage?: string;
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
  statusDescription: string;
  recipientCount: number;
  formConfig?: ResultsAnnouncementFormConfig;
};

export type ResultsAnnouncementPanelInput = {
  resultsPublished: boolean;
  status: ResultsAnnouncementStatus;
  sentAt: Date | null;
  recipientCount: number;
  partialDelivery: ResultsAnnouncementPartialDelivery | null;
  emailConfigured: boolean;
  readOnlyReason?: string;
};
