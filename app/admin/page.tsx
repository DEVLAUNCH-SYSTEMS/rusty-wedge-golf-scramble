import { DashboardSummary } from "@/components/admin/dashboard-summary";
import { getAdminDashboardSummary } from "@/lib/services/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();

  return <DashboardSummary summary={summary} />;
}
