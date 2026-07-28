import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { AdminTournamentContextBadge } from "@/components/admin/admin-tournament-context-badge";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

function WaitlistPageHeading() {
  return (
    <div>
      <h1 className={adminPageHeadingClassName}>Waitlist</h1>
      <p className={adminPageSubheadingClassName}>
        Promote active waitlist entries to pending registration review, or remove
        entries that are no longer needed.
      </p>
    </div>
  );
}

export function WaitlistPageIntro({
  tournamentYear,
  lifecycleStatus,
  isViewingActiveTournament,
}: {
  tournamentYear: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <WaitlistPageHeading />
      <AdminTournamentContextBadge
        year={tournamentYear}
        lifecycleStatus={lifecycleStatus}
        isViewingActiveTournament={isViewingActiveTournament}
      />
    </div>
  );
}
