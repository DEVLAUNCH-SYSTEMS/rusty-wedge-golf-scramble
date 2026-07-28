import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { ArchivedTournamentBanner } from "@/components/admin/archived-tournament-banner";
import { WaitlistListTable } from "@/components/admin/waitlist-list-table";
import { adminArchivedReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { listActiveWaitlistEntries } from "@/lib/services/admin-waitlist-list";
import { requireActiveTournament } from "@/lib/services/tournament";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const [entries, tournament] = await Promise.all([
    listActiveWaitlistEntries(),
    requireActiveTournament(),
  ]);
  const readOnlyReason = adminArchivedReadOnlyReason(tournament.lifecycleStatus);

  return (
    <div className="flex flex-col gap-6">
      {readOnlyReason ? <ArchivedTournamentBanner /> : null}
      <div>
        <h1 className={adminPageHeadingClassName}>Waitlist</h1>
        <p className={adminPageSubheadingClassName}>
          Promote active waitlist entries to pending registration review, or remove
          entries that are no longer needed.
        </p>
      </div>

      <WaitlistListTable entries={entries} readOnlyReason={readOnlyReason} />
    </div>
  );
}
