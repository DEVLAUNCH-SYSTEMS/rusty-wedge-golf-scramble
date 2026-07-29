import { AdminTextField } from "@/components/admin/admin-text-field";
import { CreateTournamentCapacityVenmoFields } from "@/components/admin/create-tournament-capacity-venmo-fields";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

export function CreateTournamentFeeFields({
  defaults,
}: {
  defaults: Pick<
    TournamentCreateFormValues,
    "entryFeeDollars" | "confirmedCapacityLimit" | "venmoHandle"
  >;
}) {
  return (
    <>
      <AdminTextField
        name="entryFeeDollars"
        label="Entry fee (USD)"
        defaultValue={defaults.entryFeeDollars}
        maxLength={12}
        required
      />
      <CreateTournamentCapacityVenmoFields
        confirmedCapacityLimit={defaults.confirmedCapacityLimit}
        venmoHandle={defaults.venmoHandle}
      />
    </>
  );
}
