import {
  AdminTournamentContextBadge,
  AdminViewContextBanner,
} from "@/components/admin/admin-tournament-context-badge";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type TeamsPageContextProps = {
  tournamentYear: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
};

export function TeamsPageContext(props: TeamsPageContextProps) {
  return (
    <>
      <AdminViewContextBanner
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <AdminTournamentContextBadge
        year={props.tournamentYear}
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
    </>
  );
}
