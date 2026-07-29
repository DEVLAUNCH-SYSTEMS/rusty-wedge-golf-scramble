import { notFound } from "next/navigation";

import { RegistrationDetailView } from "@/components/admin/registration-detail-view";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";

export const dynamic = "force-dynamic";

type AdminRegistrationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRegistrationDetailPage({
  params,
}: AdminRegistrationDetailPageProps) {
  const { id } = await params;
  const [registration, context] = await Promise.all([
    getAdminRegistrationDetail(id),
    resolveAdminTournamentContext(),
  ]);

  if (!registration) {
    notFound();
  }

  return (
    <RegistrationDetailView
      registration={registration}
      tournamentLifecycleStatus={context.tournament.lifecycleStatus}
      readOnlyReason={adminViewReadOnlyReason(
        context.tournament.lifecycleStatus,
        context.isViewingActiveTournament,
      )}
      isViewingActiveTournament={context.isViewingActiveTournament}
    />
  );
}
