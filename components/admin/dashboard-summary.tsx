import { AdminExportLinks } from "@/components/admin/admin-export-links";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import {
  DashboardCapacityMetrics,
  DashboardQueueMetrics,
} from "@/components/admin/dashboard-metrics";

import type { AdminDashboardSummary } from "@/lib/services/admin-dashboard";

type DashboardSummaryProps = {
  summary: AdminDashboardSummary;
};

function DashboardHeader({ name }: { name: string }) {
  return (
    <div>
      <h1 className={adminPageHeadingClassName}>Dashboard</h1>
      <p className={adminPageSubheadingClassName}>{name}</p>
    </div>
  );
}

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader name={summary.tournamentName} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCapacityMetrics summary={summary} />
        <DashboardQueueMetrics summary={summary} />
      </div>
      <AdminExportLinks />
    </div>
  );
}
