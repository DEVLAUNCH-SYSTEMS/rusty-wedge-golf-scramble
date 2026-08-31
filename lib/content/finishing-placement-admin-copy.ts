export const FINISHING_PLACEMENT_FORM_HELPER =
  "Enter the team's final placement. Identical placements are allowed when teams tie.";

export const BULK_RESULTS_EDIT_BUTTON_LABEL = "Edit results";

export const BULK_RESULTS_EDIT_HELPER =
  "Enter a placement for each team. Leave blank for no placement. Identical placements are allowed for ties.";

export const BULK_RESULTS_SAVE_LABEL = "Save results";

export const BULK_RESULTS_SAVE_PENDING_LABEL = "Saving results…";

export const BULK_RESULTS_CANCEL_LABEL = "Cancel";

export const FINISHING_PLACEMENT_UNPLACED_LABEL = "Not placed";

export function finishingPlacementCurrentLabel(
  placement: number | null | undefined,
  formatLabel: (placement: number) => string,
): string {
  if (placement == null) {
    return FINISHING_PLACEMENT_UNPLACED_LABEL;
  }

  return formatLabel(placement);
}
