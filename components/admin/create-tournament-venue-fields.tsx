import { AdminTextField } from "@/components/admin/admin-text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

export function CreateTournamentVenueFields({
  defaults,
}: {
  defaults: Pick<TournamentCreateFormValues, "teeTime" | "locationName">;
}) {
  return (
    <>
      <AdminTextField
        name="teeTime"
        label="Tee time (HH:MM)"
        defaultValue={defaults.teeTime}
        maxLength={8}
      />
      <AdminTextField
        name="locationName"
        label="Location"
        defaultValue={defaults.locationName}
        maxLength={FIELD_LIMITS.tournamentLocationName}
        required
      />
    </>
  );
}
