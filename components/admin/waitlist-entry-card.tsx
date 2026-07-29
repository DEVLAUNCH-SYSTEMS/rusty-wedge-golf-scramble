import { AdminMobileListField } from "@/components/admin/admin-mobile-list-field";
import { AdminPlayerContact } from "@/components/admin/admin-player-contact";
import { WaitlistEntryActions } from "@/components/admin/waitlist-entry-actions";

import type { AdminWaitlistEntry } from "@/lib/services/admin-waitlist-list";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function WaitlistEntryCardFields({ entry }: { entry: AdminWaitlistEntry }) {
  return (
    <div className="mt-4 grid gap-3">
      <AdminMobileListField label="Skill">{entry.skillLevel}</AdminMobileListField>
      <AdminMobileListField label="Preferred players">
        {entry.preferredPlayers ?? "—"}
      </AdminMobileListField>
      <AdminMobileListField label="Notes">{entry.notes ?? "—"}</AdminMobileListField>
      <AdminMobileListField label="Joined">{formatDate(entry.createdAt)}</AdminMobileListField>
    </div>
  );
}

export function WaitlistEntryCard({
  entry,
  readOnlyReason,
}: {
  entry: AdminWaitlistEntry;
  readOnlyReason?: string;
}) {
  return (
    <li className="list-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <AdminPlayerContact
        firstName={entry.firstName}
        lastName={entry.lastName}
        email={entry.email}
        phone={entry.phone}
      />
      <WaitlistEntryCardFields entry={entry} />
      <div className="mt-4 border-t border-slate-200 pt-4">
        <WaitlistEntryActions
          waitlistEntryId={entry.id}
          readOnlyReason={readOnlyReason}
        />
      </div>
    </li>
  );
}
