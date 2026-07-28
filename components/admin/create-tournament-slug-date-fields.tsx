import { AdminDateField } from "@/components/admin/admin-date-field";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

export function CreateTournamentYearNameFields({
  defaults,
}: {
  defaults: Pick<TournamentCreateFormValues, "name">;
}) {
  return (
    <AdminTextField
      name="name"
      label="Tournament name"
      defaultValue={defaults.name}
      maxLength={FIELD_LIMITS.tournamentName}
      required
    />
  );
}

export function CreateTournamentSlugDateFields({
  defaults,
}: {
  defaults: Pick<TournamentCreateFormValues, "slug" | "eventDate">;
}) {
  return (
    <>
      <AdminTextField
        name="slug"
        label="Slug"
        defaultValue={defaults.slug}
        maxLength={FIELD_LIMITS.tournamentSlug}
        required
      />
      <AdminDateField
        name="eventDate"
        label="Event date"
        defaultValue={defaults.eventDate}
      />
    </>
  );
}
