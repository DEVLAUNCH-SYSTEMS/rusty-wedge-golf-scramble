"use client";

import {
  adminButtonClassName,
  adminDangerButtonClassName,
} from "@/components/admin/admin-form-styles";

export function WaitlistActionButtons(props: {
  disabled: boolean;
  isPending: boolean;
  onPromote: () => void;
  onRemove: () => void;
}) {
  const { disabled, isPending, onPromote, onRemove } = props;

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={disabled || isPending} className={adminButtonClassName} onClick={onPromote}>
        {isPending ? "Working…" : "Promote"}
      </button>
      <button type="button" disabled={disabled || isPending} className={adminDangerButtonClassName} onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
