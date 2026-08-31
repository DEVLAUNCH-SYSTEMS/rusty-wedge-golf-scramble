import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminEmptyStateClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import { TeamMembersTable } from "@/components/admin/team-members-table";

import type { AdminTeamDetail } from "@/lib/services/admin-teams-list";

export function TeamRosterSection({
  team,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  readOnlyReason?: string;
}) {
  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Roster</h2>
      {team.members.length === 0 ? (
        <p className={`${adminEmptyStateClassName} mt-4 border-0 bg-transparent p-0 text-left`}>
          No players assigned yet.
        </p>
      ) : (
        <TeamMembersTable team={team} readOnlyReason={readOnlyReason} />
      )}
    </section>
  );
}
