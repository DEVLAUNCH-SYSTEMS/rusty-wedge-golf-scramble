import Link from "next/link";

import {
  adminSecondaryButtonClassName,
} from "@/components/admin/admin-form-styles";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";

import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

function sortButtonClassName(active: boolean): string {
  return active
    ? "rounded-md bg-rw-navy px-3 py-1.5 text-xs font-semibold text-white"
    : `${adminSecondaryButtonClassName} px-3 py-1.5 text-xs`;
}

function SortOptionLink({
  sort,
  activeSort,
  label,
}: {
  sort: AdminTeamListSort;
  activeSort: AdminTeamListSort;
  label: string;
}) {
  return (
    <Link href={`/admin/teams?sort=${sort}`} className={sortButtonClassName(sort === activeSort)}>
      {label}
    </Link>
  );
}

export function TeamsListSortToggle({ sort }: { sort: AdminTeamListSort }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`text-sm ${adminMutedTextClassName}`}>Sort by team number</span>
      <SortOptionLink sort="asc" activeSort={sort} label="Ascending" />
      <SortOptionLink sort="desc" activeSort={sort} label="Descending" />
    </div>
  );
}
