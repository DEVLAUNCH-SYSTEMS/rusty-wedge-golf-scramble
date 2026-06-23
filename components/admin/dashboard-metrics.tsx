import { MetricCard } from "@/components/admin/metric-card";

import type { AdminDashboardSummary } from "@/lib/services/admin-dashboard";

export function DashboardCapacityMetrics({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <>
      <MetricCard
        label="Confirmed / capacity"
        value={`${summary.confirmedCount} / ${summary.capacityLimit}`}
      />
      <MetricCard
        label="Pending review"
        value={String(summary.pendingReviewCount)}
        href="/admin/registrations?registrationStatus=pending_review&paymentStatus=submitted"
      />
      <MetricCard label="Waitlist" value={String(summary.waitlistCount)} href="/admin/waitlist" />
    </>
  );
}

export function DashboardQueueMetrics({ summary }: { summary: AdminDashboardSummary }) {
  const { assignment } = summary;

  return (
    <>
      <MetricCard
        label="Payment rejected"
        value={String(summary.paymentRejectedCount)}
        href="/admin/registrations?paymentStatus=rejected"
      />
      <MetricCard
        label="Assigned players"
        value={String(assignment.assignedCount)}
        href="/admin/registrations?registrationStatus=confirmed&assignment=assigned"
      />
      <MetricCard
        label="Unassigned confirmed"
        value={String(assignment.unassignedCount)}
        href="/admin/registrations?registrationStatus=confirmed&assignment=unassigned"
      />
    </>
  );
}
