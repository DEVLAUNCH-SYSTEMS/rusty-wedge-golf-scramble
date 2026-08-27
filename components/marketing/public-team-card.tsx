import {
  buildPublicTeamRosterSlots,
  formatPublicTeamPlayerCount,
  PUBLIC_TEAM_ROSTER_SLOT_COUNT,
} from "@/lib/format/public-team-roster-slots";
import { formatPublicTeamLabel } from "@/lib/format/team-display";

import type { PublicTeamView } from "@/lib/services/public-teams-list";

function PublicTeamCardHeader({ team }: { team: PublicTeamView }) {
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

function PublicTeamRosterRows({ team }: { team: PublicTeamView }) {
  const slots = buildPublicTeamRosterSlots(team.players);

  return (
    <ul
      className="flex flex-1 flex-col px-5 pb-5 pt-3"
      aria-label={`${formatPublicTeamLabel(team.teamNumber)} roster`}
    >
      {slots.map((slot, index) => (
        <li
          key={`${team.teamNumber}-slot-${index}`}
          className="flex min-h-9 items-center border-b border-slate-100 last:border-b-0"
        >
          {slot.isEmpty ? (
            <span className="text-sm text-slate-400" aria-label="Open roster slot">
              {slot.label}
            </span>
          ) : (
            <span className="text-sm text-slate-700">{slot.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PublicTeamCard({ team }: { team: PublicTeamView }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 border-t-2 border-t-rw-gold/80 bg-white shadow-sm">
      <PublicTeamCardHeader team={team} />
      <div className="mx-5 border-b border-slate-200" aria-hidden="true" />
      <PublicTeamRosterRows team={team} />
      <span className="sr-only">
        {PUBLIC_TEAM_ROSTER_SLOT_COUNT} roster slots reserved for scramble teams
      </span>
    </article>
  );
}
