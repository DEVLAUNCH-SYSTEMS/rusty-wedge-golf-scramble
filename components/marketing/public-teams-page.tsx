import { PublicPageHeaderBand } from "@/components/marketing/public-page-header-band";
import {
  PublicTeamCard,
  type PublicTeamCardMode,
} from "@/components/marketing/public-team-card";
import { PublicTeamsPageIntro } from "@/components/marketing/public-teams-page-intro";
import { PUBLIC_RESULTS_EMPTY_MESSAGE } from "@/lib/content/public-teams-copy";

import type { PublicNavLink } from "@/lib/content/landing-content";
import type { PublicTournamentView } from "@/lib/format/tournament-display";
import type { PublicTeamView } from "@/lib/services/public-teams-list";

function PublicTeamsEmptyState({ mode }: { mode: PublicTeamCardMode }) {
  if (mode === "results") {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
        {PUBLIC_RESULTS_EMPTY_MESSAGE}
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
      No teams have been created yet.
    </p>
  );
}

function PublicTeamsGrid({
  teams,
  mode,
}: {
  teams: PublicTeamView[];
  mode: PublicTeamCardMode;
}) {
  if (teams.length === 0) {
    return <PublicTeamsEmptyState mode={mode} />;
  }

  return (
    <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <li key={`${team.finishingPlacement ?? "roster"}-${team.teamNumber}`} className="list-none">
          <PublicTeamCard team={team} mode={mode} />
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
  mode = "roster",
}: {
  tournament: PublicTournamentView;
  teams: PublicTeamView[];
  navLinks: readonly PublicNavLink[];
  registerHref: string;
  mode?: PublicTeamCardMode;
}) {
  return (
    <main className="bg-rw-gray pb-20">
      <PublicPageHeaderBand navLinks={navLinks} registerHref={registerHref}>
        <PublicTeamsPageIntro tournament={tournament} mode={mode} />
      </PublicPageHeaderBand>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PublicTeamsGrid teams={teams} mode={mode} />
      </div>
    </main>
  );
}
