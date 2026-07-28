import { ServiceError } from "@/lib/services/service-error";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

/** Allowed edges from §7 — archive is status-only; restore is archived → completed. */
const ALLOWED_LIFECYCLE_TRANSITIONS: Record<
  TournamentLifecycleStatus,
  readonly TournamentLifecycleStatus[]
> = {
  draft: ["registration_open"],
  registration_open: ["registration_closed"],
  registration_closed: ["registration_open", "completed"],
  completed: ["archived"],
  archived: ["completed"],
};

export function allowedLifecycleTransitions(
  from: TournamentLifecycleStatus,
): readonly TournamentLifecycleStatus[] {
  return ALLOWED_LIFECYCLE_TRANSITIONS[from];
}

export function canTransitionLifecycle(
  from: TournamentLifecycleStatus,
  to: TournamentLifecycleStatus,
): boolean {
  if (from === to) {
    return false;
  }

  return ALLOWED_LIFECYCLE_TRANSITIONS[from].includes(to);
}

export function assertLifecycleTransition(
  from: TournamentLifecycleStatus,
  to: TournamentLifecycleStatus,
): void {
  if (canTransitionLifecycle(from, to)) {
    return;
  }

  throw new ServiceError(
    "INVALID_LIFECYCLE_TRANSITION",
    `Cannot transition tournament from ${from} to ${to}.`,
  );
}
