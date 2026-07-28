import { AdminViewContextBanner } from "@/components/admin/admin-tournament-context-badge";
import { WaitlistListTable } from "@/components/admin/waitlist-list-table";
import { WaitlistPageIntro } from "@/components/admin/waitlist-page-intro";

import type { AdminWaitlistEntry } from "@/lib/services/admin-waitlist-list";
import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type WaitlistPageContentProps = {
  entries: AdminWaitlistEntry[];
  readOnlyReason?: string;
  tournamentYear: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
};

export function WaitlistPageContent(props: WaitlistPageContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <AdminViewContextBanner
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <WaitlistPageIntro
        tournamentYear={props.tournamentYear}
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <WaitlistListTable
        entries={props.entries}
        readOnlyReason={props.readOnlyReason}
      />
    </div>
  );
}
