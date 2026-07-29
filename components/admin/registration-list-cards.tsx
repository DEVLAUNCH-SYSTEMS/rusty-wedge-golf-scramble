import { RegistrationListCard } from "@/components/admin/registration-list-card";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";

export function RegistrationListCards({
  registrations,
}: {
  registrations: AdminRegistrationListItem[];
}) {
  return (
    <ul className="flex flex-col gap-3 min-[1100px]:hidden">
      {registrations.map((registration) => (
        <RegistrationListCard key={registration.id} registration={registration} />
      ))}
    </ul>
  );
}
