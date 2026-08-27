import { toPublicTournamentView } from "@/lib/format/tournament-display";
import {
  listPublicTeams,
  type PublicTeamView,
} from "@/lib/services/public-teams-list";
import { getActiveTournament } from "@/lib/services/tournament";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

export type PublicTeamsPageData =
  | { status: "no_tournament" }
  | { status: "not_published"; tournament: PublicTournamentView }
  | { status: "published"; tournament: PublicTournamentView; teams: PublicTeamView[] };

export async function loadPublicTeamsPageData(): Promise<PublicTeamsPageData> {
  const tournament = await getActiveTournament();

  if (!tournament) {
    return { status: "no_tournament" };
  }

  const tournamentView = toPublicTournamentView(tournament);

  if (!tournament.teamsPublished) {
    return { status: "not_published", tournament: tournamentView };
  }

  const teams = await listPublicTeams(tournament.id);

  return { status: "published", tournament: tournamentView, teams };
}
