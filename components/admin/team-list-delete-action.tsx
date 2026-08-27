"use client";

import { DeleteTeamForm } from "@/components/admin/delete-team-form";
import { formatAdminTeamLabel } from "@/lib/format/team-display";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

export function TeamListDeleteAction({
  team,
  readOnlyReason,
}: {
  team: AdminTeamListItem;
  readOnlyReason?: string;
}) {
  return (
    <DeleteTeamForm
      compact
      teamId={team.id}
      teamLabel={formatAdminTeamLabel(team)}
      memberCount={team.memberCount}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
  );
}
