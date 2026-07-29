import Link from "next/link";

import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
  adminLinkClassName,
  adminTableBorderClassName,
} from "@/components/admin/admin-text-styles";
import { TeamMemberRemoveButton } from "@/components/admin/team-member-remove-button";
import { TeamMembersTableHead } from "@/components/admin/team-members-table-head";

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

function TeamMemberRow({
  team,
  member,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  member: AdminTeamDetail["members"][number];
  readOnlyReason?: string;
}) {
  return (
    <tr key={member.registrationId} className="hover:bg-rw-gray/60">
      <TeamMemberNameCell member={member} />
      <td className="px-4 py-3 text-rw-navy">{member.skillLevel}</td>
      <td className="px-4 py-3 text-right">
        <TeamMemberRemoveButton
          teamId={team.id}
          registrationId={member.registrationId}
          playerName={`${member.firstName} ${member.lastName}`}
          disabled={Boolean(readOnlyReason)}
          disabledMessage={readOnlyReason}
        />
      </td>
    </tr>
  );
}

export function TeamMembersTable({
  team,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  readOnlyReason?: string;
}) {
  return (
    <AdminTableScrollShell className="mt-4 rounded-xl">
      <table className={`min-w-[28rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <TeamMembersTableHead />
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {team.members.map((member) => (
            <TeamMemberRow
              key={member.registrationId}
              team={team}
              member={member}
              readOnlyReason={readOnlyReason}
            />
          ))}
        </tbody>
      </table>
    </AdminTableScrollShell>
  );
}
