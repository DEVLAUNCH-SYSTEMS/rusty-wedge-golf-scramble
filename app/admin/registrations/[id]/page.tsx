import { notFound } from "next/navigation";

import { RegistrationDetailView } from "@/components/admin/registration-detail-view";
import { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";
import { requireActiveTournament } from "@/lib/services/tournament";

export const dynamic = "force-dynamic";

type AdminRegistrationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRegistrationDetailPage({
  params,
}: AdminRegistrationDetailPageProps) {
  const { id } = await params;
  const [registration, tournament] = await Promise.all([
    getAdminRegistrationDetail(id),
    requireActiveTournament(),
  ]);

  if (!registration) {
    notFound();
  }

  return (
    <RegistrationDetailView
      registration={registration}
      tournamentLifecycleStatus={tournament.lifecycleStatus}
    />
  );
}
