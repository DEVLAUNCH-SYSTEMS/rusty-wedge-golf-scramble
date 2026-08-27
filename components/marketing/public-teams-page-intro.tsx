import { SectionLabel } from "@/components/marketing/section-label";
import { PUBLIC_TEAMS_PAGE_TITLE } from "@/lib/content/public-teams-copy";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

export function PublicTeamsPageIntro({
  tournament,
}: {
  tournament: PublicTournamentView;
}) {
  return (
    <div className="text-center">
      <SectionLabel tone="white">{PUBLIC_TEAMS_PAGE_TITLE}</SectionLabel>
      <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
        {tournament.name}
      </h1>
      <p className="mt-3 text-sm text-white/80 md:text-base">
        {tournament.eventDateShortLabel}
      </p>
    </div>
  );
}
