import Link from "next/link";

import {
  adminLinkClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import { TeamMemberRemoveButton } from "@/components/admin/team-member-remove-button";

import type { AdminTeamDetail } from "@/lib/services/admin-teams-list";

function TeamMemberNameCell({
  member,
}: {
  member: AdminTeamDetail["members"][number];
}) {
  return (
    <td className="px-4 py-3">
      <Link
        href={`/admin/registrations/${member.registrationId}`}
        className={adminLinkClassName}
      >
        {member.firstName} {member.lastName}
      </Link>
    </td>
  );
}

function TeamMemberActionsCell({
  teamId,
  member,
}: {
  teamId: string;
  member: AdminTeamDetail["members"][number];
}) {
  return (
    <td className="px-4 py-3 text-right">
      <TeamMemberRemoveButton
        teamId={teamId}
        registrationId={member.registrationId}
        playerName={`${member.firstName} ${member.lastName}`}
      />
    </td>
  );
}

export function TeamMembersTable({ team }: { team: AdminTeamDetail }) {
  return (
    <div className={`mt-4 overflow-x-auto rounded-xl border ${adminTableBorderClassName}`}>
      <table className={`min-w-full divide-y ${adminTableBorderClassName} text-sm`}>
        <thead className={adminTableHeadClassName}>
          <tr>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 font-medium">Skill</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {team.members.map((member) => (
            <tr key={member.registrationId} className="hover:bg-rw-gray/60">
              <TeamMemberNameCell member={member} />
              <td className="px-4 py-3 text-rw-navy">{member.skillLevel}</td>
              <TeamMemberActionsCell teamId={team.id} member={member} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
