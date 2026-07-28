import { adminEmptyStateClassName } from "@/components/admin/admin-text-styles";
import { RegistrationDesktopTable } from "@/components/admin/registration-desktop-table";
import { RegistrationListCards } from "@/components/admin/registration-list-cards";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";

export function RegistrationListTable({
  registrations,
}: {
  registrations: AdminRegistrationListItem[];
}) {
  if (registrations.length === 0) {
    return <p className={adminEmptyStateClassName}>No registrations match these filters.</p>;
  }

  return (
    <>
      <RegistrationListCards registrations={registrations} />
      <RegistrationDesktopTable registrations={registrations} />
    </>
  );
}
