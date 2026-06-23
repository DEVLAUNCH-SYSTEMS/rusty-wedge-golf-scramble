import { notFound } from "next/navigation";

import { TeamDetailView } from "@/components/admin/team-detail-view";
import {
  getTeamDetailForAdmin,
  listAssignablePlayersForTeam,
} from "@/lib/services/admin-teams-list";
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
  const { team, assignablePlayers } = await loadTeamDetailPageData(id);

  return <TeamDetailView team={team} assignablePlayers={assignablePlayers} />;
}
