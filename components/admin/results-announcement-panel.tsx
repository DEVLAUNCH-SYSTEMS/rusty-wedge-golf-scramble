"use client";

import { ResultsAnnouncementReadonlyPanel } from "@/components/admin/results-announcement-readonly-panel";
import { ResultsAnnouncementRecoveryForm } from "@/components/admin/results-announcement-recovery-form";
import { ResultsAnnouncementSendForm } from "@/components/admin/results-announcement-send-form";
import { resolveResultsAnnouncementPanelView } from "@/lib/content/results-announcement-panel-view";

import type { ResultsAnnouncementAdminView } from "@/lib/services/results-announcement-admin-view";

function renderInteractivePanel(
  view: ReturnType<typeof resolveResultsAnnouncementPanelView>,
) {
  const sharedProps = {
    formConfig: view.formConfig!,
    statusLabel: view.statusLabel,
    statusTone: view.statusTone,
    statusDescription: view.statusDescription,
    recipientCount: view.recipientCount,
    disabled: view.disabled,
    disabledMessage: view.disabledMessage,
  };

  if (view.mode === "send") {
    return <ResultsAnnouncementSendForm {...sharedProps} />;
  }

  return <ResultsAnnouncementRecoveryForm {...sharedProps} />;
}

export function ResultsAnnouncementPanel({
  resultsPublished,
  readOnlyReason,
  announcement,
}: {
  resultsPublished: boolean;
  readOnlyReason?: string;
  announcement: ResultsAnnouncementAdminView;
}) {
  const view = resolveResultsAnnouncementPanelView({
    resultsPublished,
    status: announcement.status,
    sentAt: announcement.sentAt,
    recipientCount: announcement.recipientCount,
    partialDelivery: announcement.partialDelivery,
    emailConfigured: announcement.emailConfigured,
    readOnlyReason,
  });

  if ((view.mode === "send" || view.mode === "recovery") && view.formConfig) {
    return renderInteractivePanel(view);
  }

  return <ResultsAnnouncementReadonlyPanel view={view} />;
}
