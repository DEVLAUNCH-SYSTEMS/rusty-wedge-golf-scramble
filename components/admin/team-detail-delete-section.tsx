import { DeleteTeamForm } from "@/components/admin/delete-team-form";
import { formatAdminTeamLabel } from "@/lib/format/team-display";

import type { AdminTeamDetail } from "@/lib/services/admin-teams-list";

export function TeamDetailDeleteSection({
  team,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  readOnlyReason?: string;
}) {
  return (
    <DeleteTeamForm
      teamId={team.id}
      teamLabel={formatAdminTeamLabel(team)}
      memberCount={team.memberCount}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
      redirectOnSuccess="/admin/teams"
    />
  );
}
