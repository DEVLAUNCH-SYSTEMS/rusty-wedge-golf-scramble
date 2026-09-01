import {
  MAX_TEAM_SIZE,
  STANDARD_FOURSOME_SIZE,
} from "@/lib/domain/team-size";
import { formatTeamRosterMemberName } from "@/lib/format/team-roster-display";

import type { PublicTeamPlayer } from "@/lib/services/public-teams-list";

/** Standard foursome roster row count for teams with fewer than five members. */
export const PUBLIC_TEAM_ROSTER_SLOT_COUNT = STANDARD_FOURSOME_SIZE;

export const PUBLIC_TEAM_EMPTY_SLOT_LABEL = "—";

export type PublicTeamRosterSlot = {
  label: string;
  isEmpty: boolean;
};

export function resolvePublicTeamRosterSlotCount(playerCount: number): number {
  return playerCount >= MAX_TEAM_SIZE ? MAX_TEAM_SIZE : STANDARD_FOURSOME_SIZE;
}

export function formatPublicTeamPlayerCount(playerCount: number): string {
  return `${playerCount} ${playerCount === 1 ? "player" : "players"}`;
}

export function buildPublicTeamRosterSlots(
  players: PublicTeamPlayer[],
): PublicTeamRosterSlot[] {
  const slotCount = resolvePublicTeamRosterSlotCount(players.length);
  const filledSlots = players.slice(0, slotCount).map((player) => ({
    label: formatTeamRosterMemberName(player),
    isEmpty: false,
  }));
  const openSlotCount = slotCount - filledSlots.length;

  return [
    ...filledSlots,
    ...Array.from({ length: openSlotCount }, () => ({
      label: PUBLIC_TEAM_EMPTY_SLOT_LABEL,
      isEmpty: true,
    })),
  ];
}
