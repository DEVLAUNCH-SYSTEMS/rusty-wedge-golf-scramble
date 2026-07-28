import { buildLifecycleActions } from "@/lib/content/tournament-lifecycle-actions";
import { ServiceError } from "@/lib/services/service-error";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export type LifecycleTransitionConfirmInput = {
  fromStatus: TournamentLifecycleStatus;
  toStatus: TournamentLifecycleStatus;
  tournamentYear: number;
  confirmYear: string;
  confirmAcknowledged: string;
};

export function assertLifecycleTransitionConfirm(
  input: LifecycleTransitionConfirmInput,
): void {
  const action = buildLifecycleActions(input.fromStatus).find(
    (candidate) => candidate.toStatus === input.toStatus,
  );

  if (!action) {
    throw new ServiceError(
      "INVALID_LIFECYCLE_TRANSITION",
      `Cannot transition tournament from ${input.fromStatus} to ${input.toStatus}.`,
    );
  }

  if (action.requiresYearConfirm) {
    if (Number(input.confirmYear) !== input.tournamentYear) {
      throw new ServiceError(
        "CONFIRMATION_REQUIRED",
        "Enter the tournament year to confirm archive.",
      );
    }
    return;
  }

  if (action.requiresAcknowledge && input.confirmAcknowledged !== "yes") {
    throw new ServiceError(
      "CONFIRMATION_REQUIRED",
      "Confirm this action before continuing.",
    );
  }
}
