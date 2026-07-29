import { AdminMobileListField } from "@/components/admin/admin-mobile-list-field";
import {
  paymentStatusTone,
  registrationStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";

function RegistrationTeamSummary({
  registration,
}: {
  registration: AdminRegistrationListItem;
}) {
  if (registration.isAssigned) {
    return registration.teamName;
  }

  if (registration.registrationStatus === "confirmed") {
    return <StatusBadge label="Unassigned" tone="warning" />;
  }

  return "—";
}

function RegistrationStatusFields({
  registration,
}: {
  registration: AdminRegistrationListItem;
}) {
  return (
    <>
      <AdminMobileListField label="Registration">
        <StatusBadge
          label={registration.registrationStatus.replaceAll("_", " ")}
          tone={registrationStatusTone(registration.registrationStatus)}
        />
      </AdminMobileListField>
      <AdminMobileListField label="Payment">
        <StatusBadge
          label={registration.paymentStatus.replaceAll("_", " ")}
          tone={paymentStatusTone(registration.paymentStatus)}
        />
      </AdminMobileListField>
      <AdminMobileListField label="Team">
        <RegistrationTeamSummary registration={registration} />
      </AdminMobileListField>
    </>
  );
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function RegistrationListCardFields({
  registration,
}: {
  registration: AdminRegistrationListItem;
}) {
  return (
    <div className="mt-4 grid gap-3">
      <AdminMobileListField label="Skill">{registration.skillLevel}</AdminMobileListField>
      <RegistrationStatusFields registration={registration} />
      <AdminMobileListField label="Submitted">
        {formatDate(registration.paymentSubmittedAt ?? registration.createdAt)}
      </AdminMobileListField>
    </div>
  );
}
