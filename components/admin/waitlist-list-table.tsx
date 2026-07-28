import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminEmptyStateClassName,
  adminMutedTextClassName,
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

function WaitlistPlayerCell({ entry }: { entry: AdminWaitlistEntry }) {
  return (
    <td className="px-4 py-3">
      <p className="font-medium text-rw-navy">
        {entry.firstName} {entry.lastName}
      </p>
      <p className={adminMutedTextClassName}>{entry.email}</p>
      <p className={adminMutedTextClassName}>{entry.phone}</p>
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
      <td className="px-4 py-3 text-sm text-slate-600">{entry.preferredPlayers ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{entry.notes ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(entry.createdAt)}</td>
      <td className="px-4 py-3">
        <WaitlistEntryActions
          waitlistEntryId={entry.id}
          readOnlyReason={readOnlyReason}
        />
      </td>
    </tr>
  );
}

function WaitlistTableBody({
  entries,
  readOnlyReason,
}: {
  entries: AdminWaitlistEntry[];
  readOnlyReason?: string;
}) {
  return (
    <tbody className={`divide-y ${adminTableBorderClassName}`}>
      {entries.map((entry) => (
        <WaitlistEntryRow
          key={entry.id}
          entry={entry}
          readOnlyReason={readOnlyReason}
        />
      ))}
    </tbody>
  );
}

export function WaitlistListTable({
  entries,
  readOnlyReason,
}: {
  entries: AdminWaitlistEntry[];
  readOnlyReason?: string;
}) {
  if (entries.length === 0) {
    return <p className={adminEmptyStateClassName}>No active waitlist entries.</p>;
  }

  return (
    <div className={`overflow-x-auto ${adminCardClassName} p-0`}>
      <table className={`min-w-full divide-y ${adminTableBorderClassName} text-sm`}>
        <WaitlistTableHead />
        <WaitlistTableBody entries={entries} readOnlyReason={readOnlyReason} />
      </table>
    </div>
  );
}
