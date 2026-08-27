export type TeamRosterMember = {
  firstName: string;
  lastName: string;
};

export function formatTeamRosterMemberName(member: TeamRosterMember): string {
  return `${member.firstName} ${member.lastName}`;
}

export function formatTeamRosterPreview(members: TeamRosterMember[]): string {
  return members.map(formatTeamRosterMemberName).join(" · ");
}

export function hasTeamRosterPreview(members: TeamRosterMember[]): boolean {
  return members.length > 0;
}
