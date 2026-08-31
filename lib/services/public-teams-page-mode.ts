export type PublicTeamsPageModeInput = {
  teamsPublished: boolean;
  resultsPublished: boolean;
};

export type PublicTeamsPageMode =
  | "not_published"
  | "results"
  | "roster";

export function resolvePublicTeamsPageMode(
  tournament: PublicTeamsPageModeInput | null | undefined,
): PublicTeamsPageMode {
  if (!tournament) {
    return "not_published";
  }

  if (tournament.resultsPublished) {
    return "results";
  }

  if (tournament.teamsPublished) {
    return "roster";
  }

  return "not_published";
}
