import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
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

export function RegistrationDesktopTable({
  registrations,
}: {
  registrations: AdminRegistrationListItem[];
}) {
  return (
    <AdminTableScrollShell className="hidden min-[1100px]:block">
      <table className={`min-w-[56rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <RegistrationTableHead />
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {registrations.map((registration) => (
            <RegistrationListRow key={registration.id} registration={registration} />
          ))}
        </tbody>
      </table>
    </AdminTableScrollShell>
  );
}
