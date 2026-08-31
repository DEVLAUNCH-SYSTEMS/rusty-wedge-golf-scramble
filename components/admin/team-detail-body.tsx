import { ArchivedTournamentBanner } from "@/components/admin/archived-tournament-banner";
import { TeamDetailSections } from "@/components/admin/team-detail-sections";

import type {
  AdminAssignablePlayer,
  AdminTeamDetail,
} from "@/lib/services/admin-teams-list";

export function TeamDetailBody(props: {
  team: AdminTeamDetail;
  assignablePlayers: AdminAssignablePlayer[];
  readOnlyReason?: string;
  placementMutationReason?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {props.readOnlyReason ? <ArchivedTournamentBanner /> : null}
      <TeamDetailSections {...props} />
    </div>
  );
}
