import { MetricCard } from "@/components/admin/metric-card";

import type { TeamAssignmentReport } from "@/lib/services/team-assignment-report";

export function TeamAssignmentPanel({ report }: { report: TeamAssignmentReport }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard label="Confirmed players" value={String(report.confirmedCount)} />
      <MetricCard label="Assigned" value={String(report.assignedCount)} />
      <MetricCard
        label="Unassigned"
        value={String(report.unassignedCount)}
        href="/admin/registrations?registrationStatus=confirmed&assignment=unassigned"
      />
    </div>
  );
}
