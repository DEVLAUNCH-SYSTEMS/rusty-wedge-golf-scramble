import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { AdminTournamentContextBadge } from "@/components/admin/admin-tournament-context-badge";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

export function RegistrationsPageIntro({
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
      <div>
        <h1 className={adminPageHeadingClassName}>Registrations</h1>
        <p className={adminPageSubheadingClassName}>
          Search and review player registrations for the selected tournament.
        </p>
      </div>
      <AdminTournamentContextBadge
        year={tournamentYear}
        lifecycleStatus={lifecycleStatus}
        isViewingActiveTournament={isViewingActiveTournament}
      />
    </div>
  );
}
