import { AdminTextField } from "@/components/admin/admin-text-field";
import { FIELD_LIMITS } from "@/lib/validation/field-limits";

type EditPlayerContactFieldsProps = {
  email: string;
  phone: string;
};

export function EditPlayerContactFields({
  email,
  phone,
}: EditPlayerContactFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminTextField
        name="email"
        label="Email"
        type="email"
        required
        maxLength={FIELD_LIMITS.email}
        defaultValue={email}
      />
      <AdminTextField
        name="phone"
        label="Phone"
        type="tel"
        required
        maxLength={FIELD_LIMITS.phone}
        defaultValue={phone}
      />
    </div>
  );
}
