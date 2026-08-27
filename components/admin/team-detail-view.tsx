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
import { DeleteTeamForm } from "@/components/admin/delete-team-form";
import { TeamMembersTable } from "@/components/admin/team-members-table";
import { formatAdminTeamLabel } from "@/lib/format/team-display";

import type {
  AdminAssignablePlayer,
  AdminTeamDetail,
} from "@/lib/services/admin-teams-list";

function TeamDetailHeader({ team }: { team: AdminTeamDetail }) {
  const teamLabel = formatAdminTeamLabel(team);

  return (
    <div>
      <Link href="/admin/teams" className={`${adminLinkClassName} text-sm`}>
        ← Back to teams
      </Link>
      <h1 className={`${adminPageHeadingClassName} mt-2`}>{teamLabel}</h1>
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

function TeamDetailDeleteSection({
  team,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  readOnlyReason?: string;
}) {
  return (
    <DeleteTeamForm
      teamId={team.id}
      teamLabel={formatAdminTeamLabel(team)}
      memberCount={team.memberCount}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
      redirectOnSuccess="/admin/teams"
    />
  );
}

function TeamDetailAssignSection({
  team,
  assignablePlayers,
  readOnlyReason,
}: {
  team: AdminTeamDetail;
  assignablePlayers: AdminAssignablePlayer[];
  readOnlyReason?: string;
}) {
  if (team.slotsRemaining <= 0) {
    return null;
  }

  return (
    <AssignPlayerForm
      teamId={team.id}
      players={assignablePlayers}
      disabled={Boolean(readOnlyReason)}
      disabledMessage={readOnlyReason}
    />
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
      <TeamDetailAssignSection
        team={team}
        assignablePlayers={assignablePlayers}
        readOnlyReason={readOnlyReason}
      />
      <TeamDetailDeleteSection team={team} readOnlyReason={readOnlyReason} />
    </div>
  );
}
