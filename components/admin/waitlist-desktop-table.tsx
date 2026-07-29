import { AdminPlayerContact } from "@/components/admin/admin-player-contact";
import { AdminTableScrollShell } from "@/components/admin/admin-table-scroll-shell";
import {
  adminTableBorderClassName,
  adminTableHeadClassName,
} from "@/components/admin/admin-text-styles";
import { WaitlistEntryActions } from "@/components/admin/waitlist-entry-actions";

import type { AdminWaitlistEntry } from "@/lib/services/admin-waitlist-list";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function WaitlistPlayerCell({ entry }: { entry: AdminWaitlistEntry }) {
  return (
    <td className="max-w-[16rem] px-4 py-3">
      <AdminPlayerContact
        firstName={entry.firstName}
        lastName={entry.lastName}
        email={entry.email}
        phone={entry.phone}
      />
    </td>
  );
}

function WaitlistEntryRow({
  entry,
  readOnlyReason,
}: {
  entry: AdminWaitlistEntry;
  readOnlyReason?: string;
}) {
  return (
    <tr className="align-top hover:bg-rw-gray/60">
      <WaitlistPlayerCell entry={entry} />
      <td className="px-4 py-3 text-rw-navy">{entry.skillLevel}</td>
      <td className="max-w-[12rem] px-4 py-3 text-sm text-slate-600">
        {entry.preferredPlayers ?? "—"}
      </td>
      <td className="max-w-[12rem] px-4 py-3 text-sm text-slate-600">{entry.notes ?? "—"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
        {formatDate(entry.createdAt)}
      </td>
      <td className="px-4 py-3">
        <WaitlistEntryActions waitlistEntryId={entry.id} readOnlyReason={readOnlyReason} />
      </td>
    </tr>
  );
}

function WaitlistTableHead() {
  return (
    <thead className={adminTableHeadClassName}>
      <tr>
        <th className="px-4 py-3 font-medium">Player</th>
        <th className="px-4 py-3 font-medium">Skill</th>
        <th className="px-4 py-3 font-medium">Preferred players</th>
        <th className="px-4 py-3 font-medium">Notes</th>
        <th className="px-4 py-3 font-medium">Joined</th>
        <th className="px-4 py-3 font-medium">Actions</th>
      </tr>
    </thead>
  );
}

export function WaitlistDesktopTable({
  entries,
  readOnlyReason,
}: {
  entries: AdminWaitlistEntry[];
  readOnlyReason?: string;
}) {
  return (
    <AdminTableScrollShell className="hidden min-[1100px]:block">
      <table className={`min-w-[48rem] divide-y ${adminTableBorderClassName} text-sm`}>
        <WaitlistTableHead />
        <tbody className={`divide-y ${adminTableBorderClassName}`}>
          {entries.map((entry) => (
            <WaitlistEntryRow key={entry.id} entry={entry} readOnlyReason={readOnlyReason} />
          ))}
        </tbody>
      </table>
    </AdminTableScrollShell>
  );
}
