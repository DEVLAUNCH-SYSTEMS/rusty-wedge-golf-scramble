import { AdminTextField } from "@/components/admin/admin-text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type EditPlayerNameFieldsProps = {
  firstName: string;
  lastName: string;
};

export function EditPlayerNameFields({
  firstName,
  lastName,
}: EditPlayerNameFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminTextField
        name="firstName"
        label="First name"
        required
        maxLength={FIELD_LIMITS.firstName}
        defaultValue={firstName}
      />
      <AdminTextField
        name="lastName"
        label="Last name"
        required
        maxLength={FIELD_LIMITS.lastName}
        defaultValue={lastName}
      />
    </div>
  );
}
