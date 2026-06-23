import {
  formInputClassName,
  formLabelClassName,
} from "@/components/forms/form-field-styles";

type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  maxLength: number;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

export function TextField({
  id,
  name,
  label,
  maxLength,
  type = "text",
  autoComplete,
  required = true,
}: TextFieldProps) {
  return (
    <label className={formLabelClassName}>
      {label}
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        className={formInputClassName}
      />
    </label>
  );
}

type TextAreaFieldProps = {
  id: string;
  name: string;
  label: string;
  maxLength: number;
  rows?: number;
  placeholder?: string;
};

export function TextAreaField({
  id,
  name,
  label,
  maxLength,
  rows = 3,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <label className={formLabelClassName}>
      {label}
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={formInputClassName}
      />
    </label>
  );
}
