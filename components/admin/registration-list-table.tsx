import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminEmptyStateClassName,
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import { RegistrationListRow } from "@/components/admin/registration-list-row";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";

function RegistrationTableHead() {
  return (
    <thead className={adminTableHeadClassName}>
      <tr>
        <th className="px-4 py-3 font-medium">Player</th>
        <th className="px-4 py-3 font-medium">Skill</th>
        <th className="px-4 py-3 font-medium">Registration</th>
        <th className="px-4 py-3 font-medium">Payment</th>
        <th className="px-4 py-3 font-medium">Team</th>
        <th className="px-4 py-3 font-medium">Submitted</th>
      </tr>
    </thead>
  );
}

export function RegistrationListTable({
  registrations,
}: {
  registrations: AdminRegistrationListItem[];
}) {
  if (registrations.length === 0) {
    return <p className={adminEmptyStateClassName}>No registrations match these filters.</p>;
  }

  return (
    <div className={`overflow-x-auto ${adminCardClassName} p-0`}>
      <table className={`min-w-full divide-y ${adminTableBorderClassName} text-sm`}>
        <RegistrationTableHead />
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {registrations.map((registration) => (
            <RegistrationListRow key={registration.id} registration={registration} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
