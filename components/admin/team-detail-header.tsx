import Link from "next/link";

import {
  adminBodyTextClassName,
  adminLinkClassName,
  adminPageHeadingClassName,
} from "@/components/admin/admin-text-styles";
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
      <p className={adminBodyTextClassName}>
        {team.memberCount} of 4 players assigned · {team.slotsRemaining} open slot
        {team.slotsRemaining === 1 ? "" : "s"}
      </p>
    </div>
  );
}
