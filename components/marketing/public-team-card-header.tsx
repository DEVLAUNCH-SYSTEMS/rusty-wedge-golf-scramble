import { formatPublicResultsPlacementHeading } from "@/lib/format/public-team-card-display";
import { formatPublicTeamPlayerCount } from "@/lib/format/public-team-roster-slots";
import { formatPublicTeamLabel } from "@/lib/format/team-display";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

function ResultsTeamCardHeader({ team }: { team: PublicTeamView }) {
  return (
    <header className="flex items-start justify-between gap-3 px-5 pt-5">
      <div>
        <h2 className="font-display text-lg font-semibold leading-snug tracking-normal text-rw-navy">
          {formatPublicResultsPlacementHeading(team.finishingPlacement!)}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {formatPublicTeamLabel(team.teamNumber)}
        </p>
      </div>
      <p className="shrink-0 text-xs font-medium text-rw-gold-accessible">
        {formatPublicTeamPlayerCount(team.players.length)}
      </p>
    </header>
  );
}

function RosterTeamCardHeader({ team }: { team: PublicTeamView }) {
  return (
    <header className="flex items-start justify-between gap-3 px-5 pt-5">
      <h2 className="font-display text-lg text-rw-navy">
        {formatPublicTeamLabel(team.teamNumber)}
      </h2>
      <p className="shrink-0 text-xs font-medium text-rw-gold-accessible">
        {formatPublicTeamPlayerCount(team.players.length)}
      </p>
    </header>
  );
}

export function PublicTeamCardHeader({
  team,
  mode,
}: {
  team: PublicTeamView;
  mode: "roster" | "results";
}) {
  if (mode === "results" && team.finishingPlacement != null) {
    return <ResultsTeamCardHeader team={team} />;
  }

  return <RosterTeamCardHeader team={team} />;
}
