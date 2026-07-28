import { adminEmptyStateClassName } from "@/components/admin/admin-text-styles";
import { WaitlistDesktopTable } from "@/components/admin/waitlist-desktop-table";
import { WaitlistListCards } from "@/components/admin/waitlist-list-cards";

import type { AdminWaitlistEntry } from "@/lib/services/admin-waitlist-list";

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
    <>
      <WaitlistListCards entries={entries} readOnlyReason={readOnlyReason} />
      <WaitlistDesktopTable entries={entries} readOnlyReason={readOnlyReason} />
    </>
  );
}
