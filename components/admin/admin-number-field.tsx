import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";

export function AdminNumberField({
  name,
  label,
  defaultValue,
  min,
}: {
  name: string;
  label: string;
  defaultValue: number;
  min: number;
}) {
  return (
    <label className={adminLabelClassName}>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        required
        defaultValue={defaultValue}
        className={adminInputClassName}
      />
    </label>
  );
}
