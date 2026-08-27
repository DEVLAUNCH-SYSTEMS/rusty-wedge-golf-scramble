import { executeTeamDeleteTransaction } from "@/lib/services/team-delete-transaction";
import { countTeamMembers, requireWritableTeam } from "@/lib/services/team-scope";

import type { AdminSession } from "@/lib/services/admin-auth";

export type DeleteTeamResult = {
  memberCount: number;
  teamName: string;
  teamNumber: number | null;
};

export async function deleteTeam(
  teamId: string,
  admin: AdminSession,
): Promise<DeleteTeamResult> {
  const { tournament, team } = await requireWritableTeam(teamId);
  const memberCount = await countTeamMembers(teamId);

  await executeTeamDeleteTransaction({
    teamId,
    tournamentId: tournament.id,
    adminUserId: admin.adminUserId,
    memberCount,
    teamName: team.name,
    teamNumber: team.teamNumber,
  });

  return {
    memberCount,
    teamName: team.name,
    teamNumber: team.teamNumber,
  };
}
