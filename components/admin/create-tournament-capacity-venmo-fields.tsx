import { AdminNumberField } from "@/components/admin/admin-number-field";
import { AdminTextField } from "@/components/admin/admin-text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

export function CreateTournamentCapacityVenmoFields({
  confirmedCapacityLimit,
  venmoHandle,
}: {
  confirmedCapacityLimit: number;
  venmoHandle: string;
}) {
  return (
    <>
      <AdminNumberField
        name="confirmedCapacityLimit"
        label="Confirmed capacity"
        defaultValue={confirmedCapacityLimit}
        min={1}
      />
      <AdminTextField
        name="venmoHandle"
        label="Venmo handle"
        defaultValue={venmoHandle}
        maxLength={FIELD_LIMITS.venmoHandle}
        required
      />
    </>
  );
}
