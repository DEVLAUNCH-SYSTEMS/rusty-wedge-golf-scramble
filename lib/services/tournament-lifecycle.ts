import { tournamentLifecycleStatusEnum } from "@/lib/db/schema/enums";

export type TournamentLifecycleStatus =
  (typeof tournamentLifecycleStatusEnum.enumValues)[number];

export function isLifecycleRegistrationOpen(
  status: TournamentLifecycleStatus,
): boolean {
  return status === "registration_open";
}

export function isLifecycleArchived(
  status: TournamentLifecycleStatus,
): boolean {
  return status === "archived";
}

export function isLifecycleDraft(status: TournamentLifecycleStatus): boolean {
  return status === "draft";
}

/** Public register/waitlist allowed only while lifecycle is open. */
export function allowsPublicRegistration(
  status: TournamentLifecycleStatus,
): boolean {
  return isLifecycleRegistrationOpen(status);
}

/** Archived tournaments are read/export only. */
export function allowsAdminMutations(
  status: TournamentLifecycleStatus,
): boolean {
  return !isLifecycleArchived(status);
}

/**
 * Derived `registration_enabled` value for mutations that keep the flag
 * in sync with lifecycle (lifecycle is source of truth).
 */
export function registrationEnabledFromLifecycle(
  status: TournamentLifecycleStatus,
): boolean {
  return isLifecycleRegistrationOpen(status);
}
