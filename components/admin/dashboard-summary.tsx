import { AdminExportLinks } from "@/components/admin/admin-export-links";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import {
  AdminTournamentContextBadge,
  AdminViewContextBanner,
} from "@/components/admin/admin-tournament-context-badge";
import {
  DashboardCapacityMetrics,
  DashboardQueueMetrics,
} from "@/components/admin/dashboard-metrics";

import type { AdminDashboardSummary } from "@/lib/services/admin-dashboard";
import type { AdminExportHrefs } from "@/lib/services/admin-export-hrefs";
import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type DashboardSummaryProps = {
  summary: AdminDashboardSummary;
  tournamentYear: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
  exportHrefs: AdminExportHrefs;
};

function DashboardTitle({ name }: { name: string }) {
  return (
    <div>
      <h1 className={adminPageHeadingClassName}>Dashboard</h1>
      <p className={adminPageSubheadingClassName}>{name}</p>
    </div>
  );
}

export function DashboardSummary(props: DashboardSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      <AdminViewContextBanner
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <div className="flex flex-col gap-3">
        <DashboardTitle name={props.summary.tournamentName} />
        <AdminTournamentContextBadge
          year={props.tournamentYear}
          lifecycleStatus={props.lifecycleStatus}
          isViewingActiveTournament={props.isViewingActiveTournament}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCapacityMetrics summary={props.summary} />
        <DashboardQueueMetrics summary={props.summary} />
      </div>
      <AdminExportLinks hrefs={props.exportHrefs} />
    </div>
  );
}
