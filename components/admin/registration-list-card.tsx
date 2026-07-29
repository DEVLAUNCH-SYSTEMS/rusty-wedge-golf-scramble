import Link from "next/link";

import { AdminPlayerContact } from "@/components/admin/admin-player-contact";
import { adminLinkClassName } from "@/components/admin/admin-text-styles";
import { RegistrationListCardFields } from "@/components/admin/registration-list-card-fields";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";

export function RegistrationListCard({
  registration,
}: {
  registration: AdminRegistrationListItem;
}) {
  return (
    <li className="list-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Link href={`/admin/registrations/${registration.id}`} className={adminLinkClassName}>
        <AdminPlayerContact
          firstName={registration.firstName}
          lastName={registration.lastName}
          email={registration.email}
          nameClassName="font-medium text-rw-navy hover:text-rw-gold-accessible"
        />
      </Link>
      <RegistrationListCardFields registration={registration} />
    </li>
  );
}
