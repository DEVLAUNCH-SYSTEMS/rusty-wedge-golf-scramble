import { PublicPageHeaderBand } from "@/components/marketing/public-page-header-band";
import { PublicTeamsPageIntro } from "@/components/marketing/public-teams-page-intro";
import { PUBLIC_TEAMS_NOT_PUBLISHED_MESSAGE } from "@/lib/content/public-teams-copy";

import type { PublicNavLink } from "@/lib/content/landing-content";
import type { PublicTournamentView } from "@/lib/format/tournament-display";

export function TeamsNotPublished({
  tournament,
  navLinks,
  registerHref,
}: {
  tournament: PublicTournamentView;
  navLinks: readonly PublicNavLink[];
  registerHref: string;
}) {
  return (
    <main className="bg-rw-gray pb-20">
      <PublicPageHeaderBand navLinks={navLinks} registerHref={registerHref}>
        <PublicTeamsPageIntro tournament={tournament} />
      </PublicPageHeaderBand>
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="text-lg text-slate-700">{PUBLIC_TEAMS_NOT_PUBLISHED_MESSAGE}</p>
      </div>
    </main>
  );
}
