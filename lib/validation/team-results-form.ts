import { ServiceError } from "@/lib/services/service-error";
import { parseOptionalTeamFinishingPlacementField } from "@/lib/validation/bulk-team-finishing-placement";
import {
  parseOptionalScoreRelativeToParField,
  parseOptionalScoreTotalStrokesField,
} from "@/lib/validation/team-score";

import type { TeamResultsInput } from "@/lib/services/team-results-mutation";

export function parseTeamResultsFromFormData(
  formData: FormData,
): TeamResultsInput {
  const hasPlacement = formData.has("finishingPlacement");
  const hasRelative = formData.has("scoreRelativeToPar");
  const hasStrokes = formData.has("scoreTotalStrokes");

  if (!hasPlacement && !hasRelative && !hasStrokes) {
    throw new ServiceError("VALIDATION", "No result fields were provided to update.");
  }

  return {
    finishingPlacement: hasPlacement
      ? parseOptionalTeamFinishingPlacementField(formData.get("finishingPlacement"))
      : undefined,
    scoreRelativeToPar: hasRelative
      ? parseOptionalScoreRelativeToParField(formData.get("scoreRelativeToPar"))
      : undefined,
    scoreTotalStrokes: hasStrokes
      ? parseOptionalScoreTotalStrokesField(formData.get("scoreTotalStrokes"))
      : undefined,
  };
}
