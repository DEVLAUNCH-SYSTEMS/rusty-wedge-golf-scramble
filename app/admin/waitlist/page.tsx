import { WaitlistPageContent } from "@/components/admin/waitlist-page-content";
import { adminViewReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { listActiveWaitlistEntries } from "@/lib/services/admin-waitlist-list";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const [entries, context] = await Promise.all([
    listActiveWaitlistEntries(),
    resolveAdminTournamentContext(),
  ]);

  return (
    <WaitlistPageContent
      entries={entries}
      readOnlyReason={adminViewReadOnlyReason(
        context.tournament.lifecycleStatus,
        context.isViewingActiveTournament,
      )}
      tournamentYear={context.tournament.year}
      lifecycleStatus={context.tournament.lifecycleStatus}
      isViewingActiveTournament={context.isViewingActiveTournament}
    />
  );
}
