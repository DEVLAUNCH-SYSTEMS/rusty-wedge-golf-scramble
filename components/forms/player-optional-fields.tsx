import { TextAreaField } from "@/components/forms/text-field";
import { REGISTRATION_FORM } from "@/lib/content/landing-content";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type PlayerOptionalFieldsProps = {
  idPrefix: string;
};

export function PlayerOptionalFields({ idPrefix }: PlayerOptionalFieldsProps) {
  return (
    <>
      <TextAreaField
        id={`${idPrefix}-preferredPlayers`}
        name="preferredPlayers"
        label={REGISTRATION_FORM.preferredPlayersLabel}
        placeholder={REGISTRATION_FORM.notesPlaceholder}
        maxLength={FIELD_LIMITS.preferredPlayers}
      />
      <TextAreaField
        id={`${idPrefix}-notes`}
        name="notes"
        label="Notes (optional)"
        maxLength={FIELD_LIMITS.playerNotes}
      />
    </>
  );
}
