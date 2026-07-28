import { AdminViewContextBanner } from "@/components/admin/admin-tournament-context-badge";
import { RegistrationListFilters } from "@/components/admin/registration-list-filters";
import { RegistrationListTable } from "@/components/admin/registration-list-table";
import { RegistrationsPageHeader } from "@/components/admin/registrations-page-header";

import type { AdminRegistrationListItem } from "@/lib/services/admin-registration-list";
import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";
import type { AdminRegistrationListFilters } from "@/lib/validation/admin-filters";

type RegistrationsPageBodyProps = {
  filters: AdminRegistrationListFilters;
  registrations: AdminRegistrationListItem[];
  readOnlyReason?: string;
  tournamentYear: number;
  lifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
};

export function RegistrationsPageBody(props: RegistrationsPageBodyProps) {
  return (
    <>
      <AdminViewContextBanner
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <RegistrationsPageHeader
        readOnlyReason={props.readOnlyReason}
        tournamentYear={props.tournamentYear}
        lifecycleStatus={props.lifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <RegistrationListFilters filters={props.filters} />
      <RegistrationListTable registrations={props.registrations} />
    </>
  );
}
