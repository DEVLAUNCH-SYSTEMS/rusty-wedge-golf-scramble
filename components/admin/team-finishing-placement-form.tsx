"use client";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { FinishingPlacementIntro } from "@/components/admin/finishing-placement-intro";
import { PlacementClearForm } from "@/components/admin/placement-clear-form";
import { PlacementSaveForm } from "@/components/admin/placement-save-form";

export function TeamFinishingPlacementForm(props: {
  teamId: string;
  finishingPlacement: number | null;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const isDisabled = props.disabled ?? false;

  return (
    <section className={adminCardClassName}>
      <FinishingPlacementIntro finishingPlacement={props.finishingPlacement} />
      <PlacementSaveForm
        teamId={props.teamId}
        finishingPlacement={props.finishingPlacement}
        disabled={isDisabled}
        disabledMessage={props.disabledMessage}
      />
      <PlacementClearForm
        teamId={props.teamId}
        disabled={isDisabled}
        disabledMessage={props.disabledMessage}
        hasPlacement={props.finishingPlacement !== null}
      />
    </section>
  );
}
