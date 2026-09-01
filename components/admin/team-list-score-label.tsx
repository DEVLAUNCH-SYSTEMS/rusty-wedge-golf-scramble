import { formatAdminTeamScoreDisplay } from "@/lib/format/admin-team-score-display";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

export function TeamListScoreLabel({ team }: { team: AdminTeamListItem }) {
  return (
    <span className="tabular-nums text-rw-navy">
      {formatAdminTeamScoreDisplay(team.scoreRelativeToPar, team.scoreTotalStrokes)}
    </span>
  );
}
