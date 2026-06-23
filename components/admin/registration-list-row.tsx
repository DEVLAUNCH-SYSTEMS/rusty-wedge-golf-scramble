import Link from "next/link";

import {
  adminLinkClassName,
  adminMutedTextClassName,
} from "@/components/admin/admin-text-styles";
import {
  paymentStatusTone,
  registrationStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";

function formatDate(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function PlayerCell({ registration }: { registration: AdminRegistrationListItem }) {
  return (
    <td className="px-4 py-3">
      <Link href={`/admin/registrations/${registration.id}`} className={adminLinkClassName}>
        {registration.firstName} {registration.lastName}
      </Link>
      <p className={adminMutedTextClassName}>{registration.email}</p>
    </td>
  );
}

function StatusCells({ registration }: { registration: AdminRegistrationListItem }) {
  return (
    <>
      <td className="px-4 py-3 text-rw-navy">{registration.skillLevel}</td>
      <td className="px-4 py-3">
        <StatusBadge
          label={registration.registrationStatus.replaceAll("_", " ")}
          tone={registrationStatusTone(registration.registrationStatus)}
        />
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          label={registration.paymentStatus.replaceAll("_", " ")}
          tone={paymentStatusTone(registration.paymentStatus)}
        />
      </td>
    </>
  );
}

function TeamAssignmentCell({
  registration,
}: {
  registration: AdminRegistrationListItem;
}) {
  if (registration.isAssigned) {
    return <span className="text-rw-navy">{registration.teamName}</span>;
  }

  if (registration.registrationStatus === "confirmed") {
    return <StatusBadge label="Unassigned" tone="warning" />;
  }

  return <span className="text-slate-400">—</span>;
}

export function RegistrationListRow({
  registration,
}: {
  registration: AdminRegistrationListItem;
}) {
  return (
    <tr className="hover:bg-rw-gray/60">
      <PlayerCell registration={registration} />
      <StatusCells registration={registration} />
      <td className="px-4 py-3">
        <TeamAssignmentCell registration={registration} />
      </td>
      <td className="px-4 py-3 text-slate-600">
        {formatDate(registration.paymentSubmittedAt ?? registration.createdAt)}
      </td>
    </tr>
  );
}
