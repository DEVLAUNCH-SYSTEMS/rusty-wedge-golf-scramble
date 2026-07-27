import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";

type AdminTextFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
  maxLength: number;
  type?: "text" | "email" | "tel";
  required?: boolean;
};

export function AdminTextField({
  name,
  label,
  defaultValue,
  maxLength,
  type = "text",
  required = false,
}: AdminTextFieldProps) {
  return (
    <label className={adminLabelClassName}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue}
        className={adminInputClassName}
      />
    </label>
  );
}
