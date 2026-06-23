import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { RegistrationListFilters } from "@/components/admin/registration-list-filters";
import { RegistrationListTable } from "@/components/admin/registration-list-table";
import { listRegistrationsForAdmin } from "@/lib/services/admin-registration-list";
import { parseAdminRegistrationListFilters } from "@/lib/validation/admin-filters";

export const dynamic = "force-dynamic";

type AdminRegistrationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRegistrationsPage({
  searchParams,
}: AdminRegistrationsPageProps) {
  const filters = parseAdminRegistrationListFilters(await searchParams);
  const registrations = await listRegistrationsForAdmin(filters);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={adminPageHeadingClassName}>Registrations</h1>
        <p className={adminPageSubheadingClassName}>
          Search and review player registrations for the active tournament.
        </p>
      </div>

      <RegistrationListFilters filters={filters} />
      <RegistrationListTable registrations={registrations} />
    </div>
  );
}
