"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { ResultsPublicationConfirmFields } from "@/components/admin/results-publication-confirm-fields";
import { ResultsPublicationStatus } from "@/components/admin/results-publication-status";
import {
  hideResultsAction,
  publishResultsAction,
} from "@/lib/actions/admin-results-publication";
import { resolveResultsPublicationFormConfig } from "@/lib/content/results-publication-copy";

export function ResultsPublicationForm({
  resultsPublished,
  disabled,
  disabledMessage,
}: {
  resultsPublished: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const formConfig = resolveResultsPublicationFormConfig(resultsPublished);

  return (
    <AdminActionForm
      title="Public results"
      submitLabel={formConfig.submitLabel}
      pendingLabel={formConfig.pendingLabel}
      danger={formConfig.danger}
      disabled={disabled}
      disabledMessage={disabledMessage}
      onSubmit={resultsPublished ? hideResultsAction : publishResultsAction}
    >
      <ResultsPublicationStatus resultsPublished={resultsPublished} />
      <ResultsPublicationConfirmFields resultsPublished={resultsPublished} />
    </AdminActionForm>
  );
}
