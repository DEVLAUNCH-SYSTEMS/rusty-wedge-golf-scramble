import { asc, desc, sql } from "drizzle-orm";

import { teams } from "@/lib/db/schema";

import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export type AdminTeamListSortRow = {
  teamNumber: number | null;
  finishingPlacement: number | null;
};

export function adminTeamsUsePlacementOrdering(
  items: readonly { finishingPlacement: number | null }[],
): boolean {
  return items.some((item) => item.finishingPlacement != null);
}

function compareTeamNumbers(
  left: number | null,
  right: number | null,
  sort: AdminTeamListSort,
): number {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  return sort === "desc" ? right - left : left - right;
}

export function compareAdminTeamsForDisplay(
  left: AdminTeamListSortRow,
  right: AdminTeamListSortRow,
  sort: AdminTeamListSort,
  usePlacementOrdering: boolean,
): number {
  if (!usePlacementOrdering) {
    return compareTeamNumbers(left.teamNumber, right.teamNumber, sort);
  }

  const leftPlaced = left.finishingPlacement != null;
  const rightPlaced = right.finishingPlacement != null;

  if (leftPlaced !== rightPlaced) {
    return leftPlaced ? -1 : 1;
  }

  if (
    leftPlaced &&
    rightPlaced &&
    left.finishingPlacement !== right.finishingPlacement
  ) {
    return left.finishingPlacement! - right.finishingPlacement!;
  }

  return compareTeamNumbers(left.teamNumber, right.teamNumber, "asc");
}

export function sortAdminTeamsForDisplay<T extends AdminTeamListSortRow>(
  items: readonly T[],
  sort: AdminTeamListSort = "asc",
): T[] {
  const usePlacementOrdering = adminTeamsUsePlacementOrdering(items);

  return [...items].sort((left, right) =>
    compareAdminTeamsForDisplay(left, right, sort, usePlacementOrdering),
  );
}

export function adminTeamNumberListOrder(sort: AdminTeamListSort) {
  return sort === "desc" ? desc(teams.teamNumber) : asc(teams.teamNumber);
}

export function adminTeamsPlacementListOrderBy() {
  return [
    asc(sql`CASE WHEN ${teams.finishingPlacement} IS NULL THEN 1 ELSE 0 END`),
    asc(teams.finishingPlacement),
    asc(teams.teamNumber),
  ];
}
