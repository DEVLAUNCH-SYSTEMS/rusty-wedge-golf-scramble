import { TextField } from "@/components/forms/text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type PlayerContactFieldsProps = {
  idPrefix: string;
};

export function PlayerContactFields({ idPrefix }: PlayerContactFieldsProps) {
  return (
    <>
      <TextField
        id={`${idPrefix}-email`}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        maxLength={FIELD_LIMITS.email}
      />
      <TextField
        id={`${idPrefix}-phone`}
        name="phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        maxLength={FIELD_LIMITS.phone}
      />
    </>
  );
}
