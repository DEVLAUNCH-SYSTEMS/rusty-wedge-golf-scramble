import { CreateTeamForm } from "@/components/admin/create-team-form";
import { TeamsListTable } from "@/components/admin/teams-list-table";
import { UnassignedPlayersPanel } from "@/components/admin/unassigned-players-panel";

import type { AdminAssignablePlayer, AdminTeamListItem } from "@/lib/services/admin-teams-list";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

function TeamsEmptyState() {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
      No teams created yet.
    </p>
  );
}

export function TeamsManagementPanels({
  teams,
  unassignedPlayers,
  sort,
  readOnlyReason,
}: {
  teams: AdminTeamListItem[];
  unassignedPlayers: AdminAssignablePlayer[];
  sort: AdminTeamListSort;
  readOnlyReason?: string;
}) {
  return (
    <>
      <CreateTeamForm
        disabled={Boolean(readOnlyReason)}
        disabledMessage={readOnlyReason}
      />
      {teams.length === 0 ? <TeamsEmptyState /> : (
        <TeamsListTable teams={teams} sort={sort} readOnlyReason={readOnlyReason} />
      )}
      <UnassignedPlayersPanel players={unassignedPlayers} />
    </>
  );
}
