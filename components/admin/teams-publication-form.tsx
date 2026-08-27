"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { TeamsPublicationConfirmFields } from "@/components/admin/teams-publication-confirm-fields";
import { TeamsPublicationStatus } from "@/components/admin/teams-publication-status";
import {
  hideTeamsAction,
  publishTeamsAction,
} from "@/lib/actions/admin-teams-publication";
import { resolveTeamsPublicationFormConfig } from "@/lib/content/teams-publication-copy";

export function TeamsPublicationForm({
  teamsPublished,
  disabled,
  disabledMessage,
}: {
  teamsPublished: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const formConfig = resolveTeamsPublicationFormConfig(teamsPublished);

  return (
    <AdminActionForm
      title="Public teams"
      submitLabel={formConfig.submitLabel}
      pendingLabel={formConfig.pendingLabel}
      danger={formConfig.danger}
      disabled={disabled}
      disabledMessage={disabledMessage}
      onSubmit={teamsPublished ? hideTeamsAction : publishTeamsAction}
    >
      <TeamsPublicationStatus teamsPublished={teamsPublished} />
      <TeamsPublicationConfirmFields teamsPublished={teamsPublished} />
    </AdminActionForm>
  );
}
