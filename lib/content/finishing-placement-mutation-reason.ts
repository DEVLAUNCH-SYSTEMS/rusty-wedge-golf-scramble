import {
  adminArchivedReadOnlyReason,
  ADMIN_NON_ACTIVE_VIEW_MESSAGE,
} from "@/lib/content/admin-archived-readonly";
import { allowsFinishingPlacementMutation } from "@/lib/services/tournament-results-lifecycle";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export const FINISHING_PLACEMENT_REGISTRATION_OPEN_MESSAGE =
  "Finishing placement can only be entered after registration closes.";

export function resolveFinishingPlacementMutationReason(input: {
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
}): string | undefined {
  const archivedReason = adminArchivedReadOnlyReason(input.lifecycleStatus);

  if (archivedReason) {
    return archivedReason;
  }

  if (!input.isViewingActiveTournament) {
    return ADMIN_NON_ACTIVE_VIEW_MESSAGE;
  }

  if (!allowsFinishingPlacementMutation(input)) {
    return FINISHING_PLACEMENT_REGISTRATION_OPEN_MESSAGE;
  }

  return undefined;
}
