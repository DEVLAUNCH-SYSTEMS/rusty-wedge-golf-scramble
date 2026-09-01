export function formatScoreRelativeToPar(relativeToPar: number): string {
  if (relativeToPar === 0) {
    return "E";
  }

  if (relativeToPar > 0) {
    return `+${relativeToPar}`;
  }

  return String(relativeToPar);
}

export function formatTeamScoreLine(
  scoreRelativeToPar: number | null | undefined,
  scoreTotalStrokes: number | null | undefined,
): string | null {
  const hasRelative = scoreRelativeToPar != null;
  const hasStrokes = scoreTotalStrokes != null;

  if (!hasRelative && !hasStrokes) {
    return null;
  }

  if (hasRelative && hasStrokes) {
    return `${formatScoreRelativeToPar(scoreRelativeToPar)} / ${scoreTotalStrokes}`;
  }

  if (hasRelative) {
    return formatScoreRelativeToPar(scoreRelativeToPar);
  }

  return String(scoreTotalStrokes);
}
