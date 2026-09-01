import { formatPublicTeamResultsScorePresentation } from "@/lib/format/public-team-results-score-display";

export function PublicTeamResultsScoreLine({
  scoreRelativeToPar,
  scoreTotalStrokes,
}: {
  scoreRelativeToPar?: number;
  scoreTotalStrokes?: number;
}) {
  const scoreLine = formatPublicTeamResultsScorePresentation(
    scoreRelativeToPar,
    scoreTotalStrokes,
  );

  if (!scoreLine) {
    return null;
  }

  return (
    <p className="mt-1 text-sm font-medium tabular-nums text-slate-700">{scoreLine}</p>
  );
}
