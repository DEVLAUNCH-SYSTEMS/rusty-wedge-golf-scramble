import { RegistrationsPageBody } from "@/components/admin/registrations-page-body";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { listRegistrationsForAdmin } from "@/lib/services/admin-registration-list";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { parseAdminRegistrationListFilters } from "@/lib/validation/admin-filters";

export const dynamic = "force-dynamic";

async function loadRegistrationsPage(searchParams: Record<string, string | string[] | undefined>) {
  const filters = parseAdminRegistrationListFilters(searchParams);
  const [registrations, context] = await Promise.all([
    listRegistrationsForAdmin(filters),
    resolveAdminTournamentContext(),
  ]);

  return { filters, registrations, context };
}

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { filters, registrations, context } = await loadRegistrationsPage(await searchParams);

  return (
    <div className="flex flex-col gap-6">
      <RegistrationsPageBody
        filters={filters}
        registrations={registrations}
        readOnlyReason={adminViewReadOnlyReason(
          context.tournament.lifecycleStatus,
          context.isViewingActiveTournament,
        )}
        tournamentYear={context.tournament.year}
        lifecycleStatus={context.tournament.lifecycleStatus}
        isViewingActiveTournament={context.isViewingActiveTournament}
      />
    </div>
  );
}
