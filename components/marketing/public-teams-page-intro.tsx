import { SectionLabel } from "@/components/marketing/section-label";
import {
  PUBLIC_RESULTS_PAGE_TITLE,
  PUBLIC_TEAMS_PAGE_TITLE,
} from "@/lib/content/public-teams-copy";

import type { PublicTeamCardMode } from "@/components/marketing/public-team-card";
import type { PublicTournamentView } from "@/lib/format/tournament-display";

function resolvePageTitle(mode: PublicTeamCardMode): string {
  return mode === "results" ? PUBLIC_RESULTS_PAGE_TITLE : PUBLIC_TEAMS_PAGE_TITLE;
}

export function PublicTeamsPageIntro({
  tournament,
  mode = "roster",
}: {
  tournament: PublicTournamentView;
  mode?: PublicTeamCardMode;
}) {
  return (
    <div className="text-center">
      <SectionLabel tone="white">{resolvePageTitle(mode)}</SectionLabel>
      <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
        {tournament.name}
      </h1>
      <p className="mt-3 text-sm text-white/80 md:text-base">
        {tournament.eventDateShortLabel}
      </p>
    </div>
  );
}
