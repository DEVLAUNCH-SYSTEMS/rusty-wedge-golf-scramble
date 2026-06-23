import Link from "next/link";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminLinkClassName,
  adminMutedTextClassName,
  adminPageHeadingClassName,
} from "@/components/admin/admin-text-styles";
import {
  paymentStatusTone,
  registrationStatusTone,
  StatusBadge,
} from "@/components/admin/status-badge";

import type { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";

type RegistrationRecord = NonNullable<
  Awaited<ReturnType<typeof getAdminRegistrationDetail>>
>;

function formatDate(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={`${adminMutedTextClassName} font-medium uppercase tracking-wide`}>
        {label}
      </dt>
      <dd className="mt-1 text-sm text-rw-navy">{value}</dd>
    </div>
  );
}

function teamLabel(registration: RegistrationRecord): string {
  if (registration.isAssigned) {
    return registration.teamName ?? "Assigned";
  }

  if (registration.registrationStatus === "confirmed") {
    return "Unassigned";
  }

  return "—";
}

function RegistrationDetailHeader({ registration }: { registration: RegistrationRecord }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4">
      <Link href="/admin/registrations" className={adminLinkClassName}>
        ← Back to registrations
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className={adminPageHeadingClassName}>
          {registration.firstName} {registration.lastName}
        </h1>
        <StatusBadge
          label={registration.registrationStatus.replaceAll("_", " ")}
          tone={registrationStatusTone(registration.registrationStatus)}
        />
        <StatusBadge
          label={registration.paymentStatus.replaceAll("_", " ")}
          tone={paymentStatusTone(registration.paymentStatus)}
        />
      </div>
    </div>
  );
}

function RegistrationCoreFields({ registration }: { registration: RegistrationRecord }) {
  return (
    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
      <DetailField label="Email" value={registration.email} />
      <DetailField label="Phone" value={registration.phone} />
      <DetailField label="Skill level" value={registration.skillLevel} />
      <DetailField label="Team" value={teamLabel(registration)} />
      <DetailField
        label="Payment submitted"
        value={formatDate(registration.paymentSubmittedAt)}
      />
      <DetailField label="Registered" value={formatDate(registration.createdAt)} />
    </dl>
  );
}

function RegistrationOptionalFields({ registration }: { registration: RegistrationRecord }) {
  return (
    <>
      {registration.preferredPlayers ? (
        <div className="mt-5">
          <DetailField label="Preferred players" value={registration.preferredPlayers} />
        </div>
      ) : null}
      {registration.notes ? (
        <div className="mt-5">
          <DetailField label="Player notes" value={registration.notes} />
        </div>
      ) : null}
      {registration.rejectionReason ? (
        <div className="mt-5">
          <DetailField label="Rejection reason" value={registration.rejectionReason} />
        </div>
      ) : null}
    </>
  );
}

export function RegistrationDetailPanel({
  registration,
}: {
  registration: RegistrationRecord;
}) {
  return (
    <section className={adminCardClassName}>
      <RegistrationDetailHeader registration={registration} />
      <RegistrationCoreFields registration={registration} />
      <RegistrationOptionalFields registration={registration} />
    </section>
  );
}
