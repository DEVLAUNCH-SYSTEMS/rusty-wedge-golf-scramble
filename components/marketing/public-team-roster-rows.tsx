import { formatPublicResultsPlacementHeading } from "@/lib/format/public-team-card-display";
import {
  buildPublicTeamRosterSlots,
  PUBLIC_TEAM_ROSTER_SLOT_COUNT,
  type PublicTeamRosterSlot,
} from "@/lib/format/public-team-roster-slots";
import { formatPublicTeamLabel } from "@/lib/format/team-display";

import type { PublicTeamCardMode } from "@/components/marketing/public-team-card";
import type { PublicTeamView } from "@/lib/services/public-teams-list";

function rosterAriaLabel(team: PublicTeamView, mode: PublicTeamCardMode): string {
  if (mode === "results" && team.finishingPlacement != null) {
    return `${formatPublicResultsPlacementHeading(team.finishingPlacement)} — ${formatPublicTeamLabel(team.teamNumber)} roster`;
  }

  return `${formatPublicTeamLabel(team.teamNumber)} roster`;
}

function PublicTeamRosterSlotRow({
  teamNumber,
  index,
  slot,
}: {
  teamNumber: number;
  index: number;
  slot: PublicTeamRosterSlot;
}) {
  return (
    <li
      key={`${teamNumber}-slot-${index}`}
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
  );
}

export function PublicTeamRosterRows({
  team,
  mode,
}: {
  team: PublicTeamView;
  mode: PublicTeamCardMode;
}) {
  const slots = buildPublicTeamRosterSlots(team.players);

  return (
    <ul className="flex flex-1 flex-col px-5 pb-5 pt-3" aria-label={rosterAriaLabel(team, mode)}>
      {slots.map((slot, index) => (
        <PublicTeamRosterSlotRow
          key={`${team.teamNumber}-slot-${index}`}
          teamNumber={team.teamNumber}
          index={index}
          slot={slot}
        />
      ))}
    </ul>
  );
}

export { PUBLIC_TEAM_ROSTER_SLOT_COUNT };
