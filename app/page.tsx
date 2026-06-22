import { SiteFooter } from "@/components/marketing/site-footer";
import { TournamentLandingPage } from "@/components/marketing/tournament-landing-page";
import { TournamentUnavailable } from "@/components/marketing/tournament-unavailable";
import { toPublicTournamentView } from "@/lib/format/tournament-display";
import { hasRegistrationCapacity } from "@/lib/services/capacity-query";
import { getActiveTournament } from "@/lib/services/tournament";

export default async function Home() {
  const tournament = await getActiveTournament();

  return (
    <>
      {tournament ? (
        <TournamentLandingPage
          tournament={toPublicTournamentView(tournament)}
          hasCapacity={await hasRegistrationCapacity(tournament.id)}
        />
      ) : (
        <TournamentUnavailable />
      )}
      <SiteFooter />
    </>
  );
}
