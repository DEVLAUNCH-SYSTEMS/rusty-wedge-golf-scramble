"use client";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { PlacementClearForm } from "@/components/admin/placement-clear-form";
import { TeamResultsIntro } from "@/components/admin/team-results-intro";
import { TeamResultsSaveForm } from "@/components/admin/team-results-save-form";

type TeamResultsFormProps = {
  teamId: string;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
  disabled: boolean;
  disabledMessage?: string;
};

function TeamResultsFormBody(props: TeamResultsFormProps) {
  return (
    <>
      <TeamResultsIntro
        finishingPlacement={props.finishingPlacement}
        scoreRelativeToPar={props.scoreRelativeToPar}
        scoreTotalStrokes={props.scoreTotalStrokes}
      />
      <TeamResultsSaveForm
        teamId={props.teamId}
        finishingPlacement={props.finishingPlacement}
        scoreRelativeToPar={props.scoreRelativeToPar}
        scoreTotalStrokes={props.scoreTotalStrokes}
        disabled={props.disabled}
        disabledMessage={props.disabledMessage}
      />
      <PlacementClearForm
        teamId={props.teamId}
        disabled={props.disabled}
        disabledMessage={props.disabledMessage}
        hasPlacement={props.finishingPlacement !== null}
      />
    </>
  );
}

export function TeamFinishingPlacementForm(props: {
  teamId: string;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  return (
    <section className={adminCardClassName}>
      <TeamResultsFormBody
        teamId={props.teamId}
        finishingPlacement={props.finishingPlacement}
        scoreRelativeToPar={props.scoreRelativeToPar}
        scoreTotalStrokes={props.scoreTotalStrokes}
        disabled={props.disabled ?? false}
        disabledMessage={props.disabledMessage}
      />
    </section>
  );
}
