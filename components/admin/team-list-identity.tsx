import Link from "next/link";

import { adminLinkClassName, adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { formatAdminTeamLabel } from "@/lib/format/team-display";
import {
  formatTeamRosterPreview,
  hasTeamRosterPreview,
} from "@/lib/format/team-roster-display";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

export function TeamListIdentity({
  team,
  headingClassName = adminLinkClassName,
}: {
  team: AdminTeamListItem;
  headingClassName?: string;
}) {
  const rosterPreview = formatTeamRosterPreview(team.rosterMembers);

  return (
    <div className="min-w-0">
      <Link href={`/admin/teams/${team.id}`} className={headingClassName}>
        {formatAdminTeamLabel(team)}
      </Link>
      {hasTeamRosterPreview(team.rosterMembers) ? (
        <p className={`mt-0.5 truncate text-xs ${adminMutedTextClassName}`}>{rosterPreview}</p>
      ) : null}
    </div>
  );
}
