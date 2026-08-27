type AdminTeamIdentity = {
  teamNumber: number | null;
  name: string;
};

export function formatAdminTeamLabel(team: AdminTeamIdentity): string {
  if (team.teamNumber != null) {
    return `Team #${team.teamNumber}`;
  }

  return team.name;
}

export function formatPublicTeamLabel(teamNumber: number): string {
  return `Team #${teamNumber}`;
}
