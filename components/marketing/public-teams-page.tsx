import { PublicPageHeaderBand } from "@/components/marketing/public-page-header-band";
import { PublicTeamCard } from "@/components/marketing/public-team-card";
import { PublicTeamsPageIntro } from "@/components/marketing/public-teams-page-intro";

import type { PublicNavLink } from "@/lib/content/landing-content";
import type { PublicTournamentView } from "@/lib/format/tournament-display";
import type { PublicTeamView } from "@/lib/services/public-teams-list";

function PublicTeamsGrid({ teams }: { teams: PublicTeamView[] }) {
  if (teams.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
        No teams have been created yet.
      </p>
    );
  }

  return (
    <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <li key={team.teamNumber} className="list-none">
          <PublicTeamCard team={team} />
        </li>
      ))}
    </ul>
  );
}

export function PublicTeamsPage({
  tournament,
  teams,
  navLinks,
  registerHref,
}: {
  tournament: PublicTournamentView;
  teams: PublicTeamView[];
  navLinks: readonly PublicNavLink[];
  registerHref: string;
}) {
  return (
    <main className="bg-rw-gray pb-20">
      <PublicPageHeaderBand navLinks={navLinks} registerHref={registerHref}>
        <PublicTeamsPageIntro tournament={tournament} />
      </PublicPageHeaderBand>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PublicTeamsGrid teams={teams} />
      </div>
    </main>
  );
}
