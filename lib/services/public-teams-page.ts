import { toPublicTournamentView } from "@/lib/format/tournament-display";
import { listPublicResults } from "@/lib/services/public-results-list";
import {
  listPublicTeams,
  type PublicTeamView,
} from "@/lib/services/public-teams-list";
import { resolvePublicTeamsPageMode } from "@/lib/services/public-teams-page-mode";
import { getActiveTournament } from "@/lib/services/tournament";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

export type PublicTeamsPublicationFlags = {
  teamsPublished: boolean;
  resultsPublished: boolean;
};

type TournamentPageData = {
  tournament: PublicTournamentView;
  publication: PublicTeamsPublicationFlags;
};

type PublishedTeamsPageData = TournamentPageData & {
  teams: PublicTeamView[];
};

export type PublicTeamsPageData =
  | { status: "no_tournament" }
  | ({ status: "not_published" } & TournamentPageData)
  | ({ status: "roster" } & PublishedTeamsPageData)
  | ({ status: "results" } & PublishedTeamsPageData);

function publicationFlags(tournament: {
  teamsPublished: boolean;
  resultsPublished: boolean;
}): PublicTeamsPublicationFlags {
  return {
    teamsPublished: tournament.teamsPublished,
    resultsPublished: tournament.resultsPublished,
  };
}

export async function loadPublicTeamsPageData(): Promise<PublicTeamsPageData> {
  const tournament = await getActiveTournament();

  if (!tournament) {
    return { status: "no_tournament" };
  }

  const tournamentView = toPublicTournamentView(tournament);
  const publication = publicationFlags(tournament);
  const mode = resolvePublicTeamsPageMode(publication);

  if (mode === "not_published") {
    return { status: "not_published", tournament: tournamentView, publication };
  }

  if (mode === "results") {
    const teams = await listPublicResults(tournament.id);
    return { status: "results", tournament: tournamentView, publication, teams };
  }

  const teams = await listPublicTeams(tournament.id);
  return { status: "roster", tournament: tournamentView, publication, teams };
}
