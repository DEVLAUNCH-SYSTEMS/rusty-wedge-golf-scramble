import { isLifecycleArchived } from "@/lib/services/tournament-lifecycle";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export const ADMIN_ARCHIVED_READONLY_MESSAGE =
  "This tournament is archived. View and export only.";

export function adminArchivedReadOnlyReason(
  lifecycleStatus: TournamentLifecycleStatus,
): string | undefined {
  if (!isLifecycleArchived(lifecycleStatus)) {
    return undefined;
  }

  return ADMIN_ARCHIVED_READONLY_MESSAGE;
}
