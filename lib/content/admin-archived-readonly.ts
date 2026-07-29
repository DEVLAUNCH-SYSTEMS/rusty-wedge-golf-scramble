import { isLifecycleArchived } from "@/lib/services/tournament-lifecycle";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export const ADMIN_ARCHIVED_READONLY_MESSAGE =
  "This tournament is archived. View and export only.";

export const ADMIN_NON_ACTIVE_VIEW_MESSAGE =
  "You are viewing a non-active tournament. Lists and dashboard reflect this year only. Switch to the active tournament to make changes.";

export function adminArchivedReadOnlyReason(
  lifecycleStatus: TournamentLifecycleStatus,
): string | undefined {
  if (!isLifecycleArchived(lifecycleStatus)) {
    return undefined;
  }

  return ADMIN_ARCHIVED_READONLY_MESSAGE;
}

export function adminViewReadOnlyReason(
  lifecycleStatus: TournamentLifecycleStatus,
  isViewingActiveTournament: boolean,
): string | undefined {
  const archivedReason = adminArchivedReadOnlyReason(lifecycleStatus);

  if (archivedReason) {
    return archivedReason;
  }

  if (!isViewingActiveTournament) {
    return ADMIN_NON_ACTIVE_VIEW_MESSAGE;
  }

  return undefined;
}
