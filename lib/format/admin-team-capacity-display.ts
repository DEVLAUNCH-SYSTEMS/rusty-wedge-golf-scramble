import { MAX_TEAM_SIZE } from "@/lib/domain/team-size";

export function formatAdminTeamMemberCapacity(memberCount: number): string {
  return `${memberCount} / ${MAX_TEAM_SIZE}`;
}

export function formatAdminTeamDetailCapacity(team: {
  memberCount: number;
  slotsRemaining: number;
}): string {
  const openSlotLabel = team.slotsRemaining === 1 ? "open slot" : "open slots";

  return `${team.memberCount} of ${MAX_TEAM_SIZE} players assigned · ${team.slotsRemaining} ${openSlotLabel}`;
}

export function computeTeamSlotsRemaining(memberCount: number): number {
  return Math.max(0, MAX_TEAM_SIZE - memberCount);
}
