import { WaitlistEntryCard } from "@/components/admin/waitlist-entry-card";

import type { AdminWaitlistEntry } from "@/lib/services/admin-waitlist-list";

export function WaitlistListCards({
  entries,
  readOnlyReason,
}: {
  entries: AdminWaitlistEntry[];
  readOnlyReason?: string;
}) {
  return (
    <ul className="flex flex-col gap-3 min-[1100px]:hidden">
      {entries.map((entry) => (
        <WaitlistEntryCard
          key={entry.id}
          entry={entry}
          readOnlyReason={readOnlyReason}
        />
      ))}
    </ul>
  );
}
