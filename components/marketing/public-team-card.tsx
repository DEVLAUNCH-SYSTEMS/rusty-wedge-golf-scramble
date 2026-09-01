import { PublicTeamCardHeader } from "@/components/marketing/public-team-card-header";
import { PublicTeamRosterRows } from "@/components/marketing/public-team-roster-rows";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

export type PublicTeamCardMode = "roster" | "results";

export function PublicTeamCard({
  team,
  mode = "roster",
}: {
  team: PublicTeamView;
  mode?: PublicTeamCardMode;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 border-t-2 border-t-rw-gold/80 bg-white shadow-sm">
      <PublicTeamCardHeader team={team} mode={mode} />
      <div className="mx-5 border-b border-slate-200" aria-hidden="true" />
      <PublicTeamRosterRows team={team} mode={mode} />
      <span className="sr-only">Team roster for scramble teams</span>
    </article>
  );
}
