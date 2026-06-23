import { TextField } from "@/components/forms/text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type PlayerNameFieldsProps = {
  idPrefix: string;
};

export function PlayerNameFields({ idPrefix }: PlayerNameFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        id={`${idPrefix}-firstName`}
        name="firstName"
        label="First name"
        maxLength={FIELD_LIMITS.firstName}
      />
      <TextField
        id={`${idPrefix}-lastName`}
        name="lastName"
        label="Last name"
        maxLength={FIELD_LIMITS.lastName}
      />
    </div>
  );
}
