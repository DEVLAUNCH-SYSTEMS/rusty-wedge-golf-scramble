import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";

type AdminTextAreaFieldProps = {
  name: string;
  label: string;
  maxLength: number;
  rows?: number;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
};

export function AdminTextAreaField({
  name,
  label,
  maxLength,
  rows = 3,
  required = false,
  defaultValue,
  placeholder,
}: AdminTextAreaFieldProps) {
  return (
    <label className={adminLabelClassName}>
      {label}
      <textarea
        name={name}
        required={required}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={adminInputClassName}
      />
    </label>
  );
}
