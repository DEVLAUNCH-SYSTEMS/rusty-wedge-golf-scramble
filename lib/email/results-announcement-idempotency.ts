export function buildResultsAnnouncementIdempotencyKey(tournamentId: string): string {
  return `results-announcement:${tournamentId}`;
}

export function buildResultsAnnouncementSmokeTestIdempotencyKey(
  tournamentId: string,
  runSuffix: string,
): string {
  return `results-announcement-smoke:${tournamentId}:${runSuffix}`;
}
