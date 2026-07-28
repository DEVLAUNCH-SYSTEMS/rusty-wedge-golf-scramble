import { AdminNumberField } from "@/components/admin/admin-number-field";
import {
  CreateTournamentSlugDateFields,
  CreateTournamentYearNameFields,
} from "@/components/admin/create-tournament-slug-date-fields";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

export function CreateTournamentIdentityFields({
  defaults,
}: {
  defaults: TournamentCreateFormValues;
}) {
  return (
    <>
      <AdminNumberField
        name="year"
        label="Year"
        defaultValue={defaults.year}
        min={2000}
      />
      <CreateTournamentYearNameFields defaults={defaults} />
      <CreateTournamentSlugDateFields defaults={defaults} />
    </>
  );
}
