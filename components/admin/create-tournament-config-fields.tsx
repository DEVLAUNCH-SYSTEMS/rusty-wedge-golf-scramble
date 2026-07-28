import { CreateTournamentFeeFields } from "@/components/admin/create-tournament-fee-fields";
import { CreateTournamentVenueFields } from "@/components/admin/create-tournament-venue-fields";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

export function CreateTournamentConfigFields({
  defaults,
}: {
  defaults: TournamentCreateFormValues;
}) {
  return (
    <>
      <CreateTournamentVenueFields defaults={defaults} />
      <CreateTournamentFeeFields defaults={defaults} />
    </>
  );
}
