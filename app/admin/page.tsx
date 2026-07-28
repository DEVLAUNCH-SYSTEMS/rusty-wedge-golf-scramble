import { DashboardSummary } from "@/components/admin/dashboard-summary";
import { getAdminDashboardSummary } from "@/lib/services/admin-dashboard";
import { buildAdminExportHrefs } from "@/lib/services/admin-export-hrefs";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [summary, context] = await Promise.all([
    getAdminDashboardSummary(),
    resolveAdminTournamentContext(),
  ]);

  return (
    <DashboardSummary
      summary={summary}
      tournamentYear={context.tournament.year}
      lifecycleStatus={context.tournament.lifecycleStatus}
      isViewingActiveTournament={context.isViewingActiveTournament}
      exportHrefs={buildAdminExportHrefs(context)}
    />
  );
}
