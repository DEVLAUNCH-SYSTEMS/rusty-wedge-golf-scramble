import { formatTeamScoreLine } from "@/lib/format/team-score-display";

export function formatPublicTeamResultsScoreLine(
  scoreRelativeToPar: number | null | undefined,
  scoreTotalStrokes: number | null | undefined,
): string | null {
  return formatTeamScoreLine(scoreRelativeToPar, scoreTotalStrokes);
}

export function formatPublicTeamResultsScorePresentation(
  scoreRelativeToPar: number | null | undefined,
  scoreTotalStrokes: number | null | undefined,
): string | null {
  const scoreLine = formatPublicTeamResultsScoreLine(
    scoreRelativeToPar,
    scoreTotalStrokes,
  );

  if (!scoreLine) {
    return null;
  }

  return `Score: ${scoreLine}`;
}
