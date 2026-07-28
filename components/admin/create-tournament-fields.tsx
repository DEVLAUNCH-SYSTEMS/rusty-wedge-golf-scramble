import { CreateTournamentConfigFields } from "@/components/admin/create-tournament-config-fields";
import { CreateTournamentIdentityFields } from "@/components/admin/create-tournament-identity-fields";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

export function CreateTournamentFields({
  defaults,
}: {
  defaults: TournamentCreateFormValues;
}) {
  return (
    <>
      <CreateTournamentIdentityFields defaults={defaults} />
      <CreateTournamentConfigFields defaults={defaults} />
    </>
  );
}
