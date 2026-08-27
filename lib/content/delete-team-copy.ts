export function deleteTeamDescription(
  teamLabel: string,
  memberCount: number,
): string {
  if (memberCount > 0) {
    return `Delete ${teamLabel}? Its ${memberCount} assigned player${memberCount === 1 ? "" : "s"} will become unassigned. Registrations are preserved.`;
  }

  return `Delete ${teamLabel}? This team has no assigned players.`;
}

export function deleteTeamAcknowledgementCopy(memberCount: number): string {
  if (memberCount > 0) {
    return "I understand that deleting this team will unassign its assigned players and preserve their registrations.";
  }

  return "I understand that this empty team will be permanently deleted.";
}
