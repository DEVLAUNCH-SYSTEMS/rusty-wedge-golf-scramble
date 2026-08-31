import { TeamDetailAssignSection } from "@/components/admin/team-detail-assign-section";
import { TeamDetailDeleteSection } from "@/components/admin/team-detail-delete-section";
import { TeamDetailHeader } from "@/components/admin/team-detail-header";
import { TeamDetailPlacementSection } from "@/components/admin/team-detail-placement-section";
import { TeamRosterSection } from "@/components/admin/team-roster-section";

import type {
  AdminAssignablePlayer,
  AdminTeamDetail,
} from "@/lib/services/admin-teams-list";

export function TeamDetailSections(props: {
  team: AdminTeamDetail;
  assignablePlayers: AdminAssignablePlayer[];
  readOnlyReason?: string;
  placementMutationReason?: string;
}) {
  return (
    <>
      <TeamDetailHeader team={props.team} />
      <TeamDetailPlacementSection
        team={props.team}
        placementMutationReason={props.placementMutationReason}
      />
      <TeamRosterSection team={props.team} readOnlyReason={props.readOnlyReason} />
      <TeamDetailAssignSection
        team={props.team}
        assignablePlayers={props.assignablePlayers}
        readOnlyReason={props.readOnlyReason}
      />
      <TeamDetailDeleteSection team={props.team} readOnlyReason={props.readOnlyReason} />
    </>
  );
}
