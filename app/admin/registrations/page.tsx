import Link from "next/link";

import {
  adminButtonClassName,
  adminSecondaryButtonClassName,
} from "@/components/admin/admin-form-styles";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { ArchivedTournamentBanner } from "@/components/admin/archived-tournament-banner";
import { RegistrationListFilters } from "@/components/admin/registration-list-filters";
import { RegistrationListTable } from "@/components/admin/registration-list-table";
import { adminArchivedReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { listRegistrationsForAdmin } from "@/lib/services/admin-registration-list";
import { requireActiveTournament } from "@/lib/services/tournament";
import { parseAdminRegistrationListFilters } from "@/lib/validation/admin-filters";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";
import type { AdminRegistrationListFilters } from "@/lib/validation/admin-filters";

function RegistrationsPageHeader({ readOnlyReason }: { readOnlyReason?: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className={adminPageHeadingClassName}>Registrations</h1>
        <p className={adminPageSubheadingClassName}>
          Search and review player registrations for the active tournament.
        </p>
      </div>
      {readOnlyReason ? (
        <span
          className={`${adminSecondaryButtonClassName} cursor-not-allowed opacity-60`}
          aria-disabled="true"
          title={readOnlyReason}
        >
          Add player
        </span>
      ) : (
        <Link href="/admin/registrations/new" className={adminButtonClassName}>
          Add player
        </Link>
      )}
    </div>
  );
}

function RegistrationsPageBody({
  filters,
  registrations,
  readOnlyReason,
}: {
  filters: AdminRegistrationListFilters;
  registrations: AdminRegistrationListItem[];
  readOnlyReason?: string;
}) {
  return (
    <>
      {readOnlyReason ? <ArchivedTournamentBanner /> : null}
      <RegistrationsPageHeader readOnlyReason={readOnlyReason} />
      <RegistrationListFilters filters={filters} />
      <RegistrationListTable registrations={registrations} />
    </>
  );
}

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseAdminRegistrationListFilters(await searchParams);
  const [registrations, tournament] = await Promise.all([
    listRegistrationsForAdmin(filters),
    requireActiveTournament(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <RegistrationsPageBody
        filters={filters}
        registrations={registrations}
        readOnlyReason={adminArchivedReadOnlyReason(tournament.lifecycleStatus)}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
