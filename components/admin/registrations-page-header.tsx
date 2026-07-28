import { RegistrationsAddPlayerLink } from "@/components/admin/registrations-add-player-link";
import { RegistrationsPageIntro } from "@/components/admin/registrations-page-intro";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type RegistrationsPageHeaderProps = {
  readOnlyReason?: string;
  tournamentYear: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
};

export function RegistrationsPageHeader(props: RegistrationsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <RegistrationsPageIntro
        tournamentYear={props.tournamentYear}
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <RegistrationsAddPlayerLink readOnlyReason={props.readOnlyReason} />
    </div>
  );
}
