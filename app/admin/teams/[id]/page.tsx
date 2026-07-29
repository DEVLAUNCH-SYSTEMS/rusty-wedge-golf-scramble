import { notFound } from "next/navigation";

import { TeamDetailView } from "@/components/admin/team-detail-view";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import {
  getTeamDetailForAdmin,
  listAssignablePlayersForTeam,
} from "@/lib/services/admin-teams-list";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { ServiceError } from "@/lib/services/service-error";

export const dynamic = "force-dynamic";

type AdminTeamDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function loadTeamDetailPageData(teamId: string) {
  try {
    const [team, assignablePlayers] = await Promise.all([
      getTeamDetailForAdmin(teamId),
      listAssignablePlayersForTeam(),
    ]);

    return { team, assignablePlayers };
  } catch (error) {
    if (error instanceof ServiceError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }
}

export default async function AdminTeamDetailPage({ params }: AdminTeamDetailPageProps) {
  const { id } = await params;
  const [data, context] = await Promise.all([
    loadTeamDetailPageData(id),
    resolveAdminTournamentContext(),
  ]);

  return (
    <TeamDetailView
      team={data.team}
      assignablePlayers={data.assignablePlayers}
      readOnlyReason={adminViewReadOnlyReason(
        context.tournament.lifecycleStatus,
        context.isViewingActiveTournament,
      )}
    />
  );
}
