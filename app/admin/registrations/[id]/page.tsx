import { notFound } from "next/navigation";

import { RegistrationDetailView } from "@/components/admin/registration-detail-view";
import { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";

export const dynamic = "force-dynamic";

type AdminRegistrationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRegistrationDetailPage({
  params,
}: AdminRegistrationDetailPageProps) {
  const { id } = await params;
  const registration = await getAdminRegistrationDetail(id);

  if (!registration) {
    notFound();
  }

  return <RegistrationDetailView registration={registration} />;
}
