import {
  TeamsListSortStatus,
  TeamsListTeamNumberSortToggle,
} from "@/components/admin/teams-list-sort-controls";
import { adminTeamsUsePlacementOrdering } from "@/lib/services/admin-teams-list-order";

import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export function TeamsListSortToggle({
  sort,
  disabled = false,
  teams = [],
}: {
  sort: AdminTeamListSort;
  disabled?: boolean;
  teams?: readonly { finishingPlacement: number | null }[];
}) {
  if (disabled) {
    return (
      <TeamsListSortStatus message="Sorting is unavailable while editing results." />
    );
  }

  if (adminTeamsUsePlacementOrdering(teams)) {
    return <TeamsListSortStatus message="Sorted by finishing placement" />;
  }

  return <TeamsListTeamNumberSortToggle sort={sort} />;
}
