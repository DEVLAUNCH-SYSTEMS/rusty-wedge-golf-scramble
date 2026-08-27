import { formatTeamRosterMemberName } from "@/lib/format/team-roster-display";

import type { PublicTeamPlayer } from "@/lib/services/public-teams-list";

export const PUBLIC_TEAM_ROSTER_SLOT_COUNT = 4;

export const PUBLIC_TEAM_EMPTY_SLOT_LABEL = "—";

export type PublicTeamRosterSlot = {
  label: string;
  isEmpty: boolean;
};

export function formatPublicTeamPlayerCount(playerCount: number): string {
  return `${playerCount} ${playerCount === 1 ? "player" : "players"}`;
}

export function buildPublicTeamRosterSlots(
  players: PublicTeamPlayer[],
): PublicTeamRosterSlot[] {
  const filledSlots = players.slice(0, PUBLIC_TEAM_ROSTER_SLOT_COUNT).map((player) => ({
    label: formatTeamRosterMemberName(player),
    isEmpty: false,
  }));

  const openSlotCount = PUBLIC_TEAM_ROSTER_SLOT_COUNT - filledSlots.length;

  return [
    ...filledSlots,
    ...Array.from({ length: openSlotCount }, () => ({
      label: PUBLIC_TEAM_EMPTY_SLOT_LABEL,
      isEmpty: true,
    })),
  ];
}
