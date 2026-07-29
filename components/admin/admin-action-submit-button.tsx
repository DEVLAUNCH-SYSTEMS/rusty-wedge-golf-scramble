import {
  adminButtonClassName,
  adminDangerButtonClassName,
} from "@/components/admin/admin-form-styles";

type AdminActionSubmitButtonProps = {
  danger: boolean;
  isPending: boolean;
  disabled: boolean;
  submitLabel: string;
  pendingLabel: string;
};

export function AdminActionSubmitButton({
  danger,
  isPending,
  disabled,
  submitLabel,
  pendingLabel,
}: AdminActionSubmitButtonProps) {
  const className = danger ? adminDangerButtonClassName : adminButtonClassName;

  return (
    <button type="submit" disabled={isPending || disabled} className={className}>
      {isPending ? pendingLabel : submitLabel}
    </button>
  );
}
