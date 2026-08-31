import { ServiceError } from "@/lib/services/service-error";
import {
  isLifecycleArchived,
  type TournamentLifecycleStatus,
} from "@/lib/services/tournament-lifecycle";

const PLACEMENT_MUTATION_LIFECYCLE: ReadonlySet<TournamentLifecycleStatus> =
  new Set(["registration_closed", "completed"]);

export function allowsFinishingPlacementMutation(input: {
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
}): boolean {
  if (!input.isViewingActiveTournament) {
    return false;
  }

  if (isLifecycleArchived(input.lifecycleStatus)) {
    return false;
  }

  return PLACEMENT_MUTATION_LIFECYCLE.has(input.lifecycleStatus);
}

export function assertFinishingPlacementMutationAllowed(input: {
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
}): void {
  if (allowsFinishingPlacementMutation(input)) {
    return;
  }

  if (!input.isViewingActiveTournament) {
    throw new ServiceError(
      "TOURNAMENT_NOT_ACTIVE",
      "Finishing placement can only be changed for the active tournament.",
    );
  }

  if (isLifecycleArchived(input.lifecycleStatus)) {
    throw new ServiceError(
      "TOURNAMENT_ARCHIVED",
      "This tournament is archived and cannot be modified.",
    );
  }

  throw new ServiceError(
    "FINISHING_PLACEMENT_NOT_ALLOWED",
    "Finishing placement can only be entered after registration closes.",
  );
}
