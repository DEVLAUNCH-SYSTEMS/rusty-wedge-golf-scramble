import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";

export function AdminDateField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className={adminLabelClassName}>
      {label}
      <input
        name={name}
        type="date"
        required
        defaultValue={defaultValue}
        className={adminInputClassName}
      />
    </label>
  );
}
