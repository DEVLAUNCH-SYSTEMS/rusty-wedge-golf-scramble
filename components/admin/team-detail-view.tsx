import { TeamDetailBody } from "@/components/admin/team-detail-body";

import type {
  AdminAssignablePlayer,
  AdminTeamDetail,
} from "@/lib/services/admin-teams-list";

export function TeamDetailView(props: {
  team: AdminTeamDetail;
  assignablePlayers: AdminAssignablePlayer[];
  readOnlyReason?: string;
  placementMutationReason?: string;
}) {
  return <TeamDetailBody {...props} />;
}
