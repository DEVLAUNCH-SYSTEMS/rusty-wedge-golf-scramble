import Link from "next/link";

import {
  adminBodyTextClassName,
  adminLinkClassName,
  adminPageHeadingClassName,
} from "@/components/admin/admin-text-styles";
import { formatAdminTeamDetailCapacity } from "@/lib/format/admin-team-capacity-display";
import { formatAdminTeamLabel } from "@/lib/format/team-display";

import type { AdminTeamDetail } from "@/lib/services/admin-teams-list";

export function TeamDetailHeader({ team }: { team: AdminTeamDetail }) {
  const teamLabel = formatAdminTeamLabel(team);

  return (
    <div>
      <Link href="/admin/teams" className={`${adminLinkClassName} text-sm`}>
        ← Back to teams
      </Link>
      <h1 className={`${adminPageHeadingClassName} mt-2`}>{teamLabel}</h1>
      <p className={adminBodyTextClassName}>{formatAdminTeamDetailCapacity(team)}</p>
    </div>
  );
}
