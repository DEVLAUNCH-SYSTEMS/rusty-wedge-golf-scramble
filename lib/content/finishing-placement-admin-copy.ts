export const FINISHING_PLACEMENT_FORM_HELPER =
  "Enter placement and optional scores. Fields are independent — leave blank to clear a value. Identical placements are allowed when teams tie.";

export const BULK_RESULTS_EDIT_BUTTON_LABEL = "Edit results";

export const BULK_RESULTS_EDIT_HELPER =
  "Enter placement and optional scores for each team. Fields are independent — leave blank to clear. Identical placements are allowed for ties.";

export const BULK_RESULTS_PLACE_COLUMN_LABEL = "Place";

export const BULK_RESULTS_RELATIVE_COLUMN_LABEL = "Rel. to par";

export const BULK_RESULTS_STROKES_COLUMN_LABEL = "Strokes";

export const TEAM_RESULTS_SECTION_TITLE = "Tournament results";

export const TEAM_RESULTS_FORM_HELPER =
  "Update placement and/or scores. Leave a field blank to clear it. Clearing placement does not clear scores.";

export function teamScoreCurrentLabel(value: number | null | undefined): string {
  if (value == null) {
    return "Not set";
  }

  return String(value);
}

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
