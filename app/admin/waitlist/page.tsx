import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { WaitlistListTable } from "@/components/admin/waitlist-list-table";
import { listActiveWaitlistEntries } from "@/lib/services/admin-waitlist-list";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const entries = await listActiveWaitlistEntries();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={adminPageHeadingClassName}>Waitlist</h1>
        <p className={adminPageSubheadingClassName}>
          Promote active waitlist entries to pending registration review, or remove
          entries that are no longer needed.
        </p>
      </div>

      <WaitlistListTable entries={entries} />
    </div>
  );
}
