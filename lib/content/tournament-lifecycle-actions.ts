import { allowedLifecycleTransitions } from "@/lib/services/tournament-lifecycle-transitions";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export type TournamentLifecycleAction = {
  toStatus: TournamentLifecycleStatus;
  label: string;
  description: string;
  danger: boolean;
  requiresYearConfirm: boolean;
  requiresAcknowledge: boolean;
};

function openRegistrationMeta(
  from: TournamentLifecycleStatus,
): Omit<TournamentLifecycleAction, "toStatus"> {
  const reopen = from === "registration_closed";
  return {
    label: reopen ? "Reopen registration" : "Open registration",
    description: reopen
      ? "Allow public registration again for this tournament."
      : "Make this tournament available for public registration.",
    danger: false,
    requiresYearConfirm: false,
    requiresAcknowledge: reopen,
  };
}

function closeRegistrationMeta(): Omit<TournamentLifecycleAction, "toStatus"> {
  return {
    label: "Close registration",
    description: "Stop new public registrations while admin work continues.",
    danger: false,
    requiresYearConfirm: false,
    requiresAcknowledge: true,
  };
}

function completedMeta(
  from: TournamentLifecycleStatus,
): Omit<TournamentLifecycleAction, "toStatus"> {
  if (from === "archived") {
    return {
      label: "Restore from archive",
      description:
        "Return this tournament to completed status for admin work.",
      danger: false,
      requiresYearConfirm: false,
      requiresAcknowledge: true,
    };
  }

  return {
    label: "Mark completed",
    description: "Mark the event finished before archiving.",
    danger: true,
    requiresYearConfirm: false,
    requiresAcknowledge: true,
  };
}

function archiveMeta(): Omit<TournamentLifecycleAction, "toStatus"> {
  return {
    label: "Archive tournament",
    description: "Move this tournament to read-only history.",
    danger: true,
    requiresYearConfirm: true,
    requiresAcknowledge: false,
  };
}

function lifecycleActionMeta(
  from: TournamentLifecycleStatus,
  to: TournamentLifecycleStatus,
): Omit<TournamentLifecycleAction, "toStatus"> {
  if (to === "registration_open") return openRegistrationMeta(from);
  if (to === "registration_closed") return closeRegistrationMeta();
  if (to === "completed") return completedMeta(from);
  if (to === "archived") return archiveMeta();
  throw new Error(`Unsupported lifecycle transition from ${from} to ${to}.`);
}

export function buildLifecycleActions(
  from: TournamentLifecycleStatus,
): TournamentLifecycleAction[] {
  return allowedLifecycleTransitions(from).map((toStatus) => ({
    toStatus,
    ...lifecycleActionMeta(from, toStatus),
  }));
}
