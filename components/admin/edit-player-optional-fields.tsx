import { AdminTextAreaField } from "@/components/admin/admin-textarea-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type EditPlayerOptionalFieldsProps = {
  preferredPlayers: string | null;
  notes: string | null;
};

export function EditPlayerOptionalFields({
  preferredPlayers,
  notes,
}: EditPlayerOptionalFieldsProps) {
  return (
    <>
      <AdminTextAreaField
        name="preferredPlayers"
        label="Preferred players"
        maxLength={FIELD_LIMITS.preferredPlayers}
        defaultValue={preferredPlayers ?? ""}
      />
      <p className="text-xs text-slate-500">
        Changing this player&apos;s name does not update preferred-player text
        on other registrations.
      </p>
      <AdminTextAreaField
        name="notes"
        label="Player notes"
        maxLength={FIELD_LIMITS.playerNotes}
        defaultValue={notes ?? ""}
      />
    </>
  );
}
