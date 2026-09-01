import { formatTeamScoreLine } from "@/lib/format/team-score-display";

export const ADMIN_TEAM_SCORE_EMPTY_LABEL = "—";

export function formatAdminTeamScoreDisplay(
  scoreRelativeToPar: number | null,
  scoreTotalStrokes: number | null,
): string {
  return (
    formatTeamScoreLine(scoreRelativeToPar, scoreTotalStrokes) ??
    ADMIN_TEAM_SCORE_EMPTY_LABEL
  );
}
