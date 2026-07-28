import Link from "next/link";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminBodyTextClassName,
  adminEmptyStateClassName,
  adminLinkClassName,
  adminPageHeadingClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import { ArchivedTournamentBanner } from "@/components/admin/archived-tournament-banner";
import { AssignPlayerForm } from "@/components/admin/assign-player-form";
import { TeamMembersTable } from "@/components/admin/team-members-table";

import type {
  AdminAssignablePlayer,
  AdminTeamDetail,
} from "@/lib/services/admin-teams-list";

function TeamDetailHeader({ team }: { team: AdminTeamDetail }) {
  return (
    <div>
      <Link href="/admin/teams" className={`${adminLinkClassName} text-sm`}>
        ← Back to teams
      </Link>
      <h1 className={`${adminPageHeadingClassName} mt-2`}>{team.name}</h1>
      <p className={adminBodyTextClassName}>
        {team.memberCount} of 4 players assigned · {team.slotsRemaining} open slot
        {team.slotsRemaining === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function TeamRosterSection({
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

export function TeamDetailView({
  team,
  assignablePlayers,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  assignablePlayers: AdminAssignablePlayer[];
  readOnlyReason?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {readOnlyReason ? <ArchivedTournamentBanner /> : null}
      <TeamDetailHeader team={team} />
      <TeamRosterSection team={team} readOnlyReason={readOnlyReason} />
      {team.slotsRemaining > 0 ? (
        <AssignPlayerForm
          teamId={team.id}
          players={assignablePlayers}
          disabled={Boolean(readOnlyReason)}
          disabledMessage={readOnlyReason}
        />
      ) : null}
    </div>
  );
}
