"use client";

import { AdminActionFormBody } from "@/components/admin/admin-action-form-body";
import { resolveAdminFormDisabledMessage } from "@/components/admin/resolve-admin-form-disabled-message";
import { TeamResultsInputGrid } from "@/components/admin/team-results-input-grid";
import { useTeamResultsSaveForm } from "@/hooks/use-team-results-save-form";

type TeamResultsSaveFormProps = {
  teamId: string;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
  disabled: boolean;
  disabledMessage?: string;
};

export function TeamResultsSaveForm(props: TeamResultsSaveFormProps) {
  const form = useTeamResultsSaveForm(props.teamId, props.disabled);

  return (
    <AdminActionFormBody
      disabled={props.disabled}
      danger={false}
      isPending={form.isPending}
      submitLabel="Save results"
      pendingLabel="Saving…"
      displayMessage={resolveAdminFormDisabledMessage(
        props.disabled,
        props.disabledMessage,
        form.message,
      )}
      onSubmit={form.saveResults}
    >
      <TeamResultsInputGrid
        finishingPlacement={props.finishingPlacement}
        scoreRelativeToPar={props.scoreRelativeToPar}
        scoreTotalStrokes={props.scoreTotalStrokes}
      />
    </AdminActionFormBody>
  );
}
