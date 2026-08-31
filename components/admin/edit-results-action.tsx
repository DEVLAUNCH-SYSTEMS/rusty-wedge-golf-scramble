"use client";

import { adminButtonClassName } from "@/components/admin/admin-form-styles";
import { BULK_RESULTS_EDIT_BUTTON_LABEL } from "@/lib/content/finishing-placement-admin-copy";

export function EditResultsAction({
  disabled,
  onStartEdit,
}: {
  disabled: boolean;
  onStartEdit: () => void;
}) {
  return (
    <button
      type="button"
      className={`${adminButtonClassName} w-full`}
      disabled={disabled}
      onClick={onStartEdit}
    >
      {BULK_RESULTS_EDIT_BUTTON_LABEL}
    </button>
  );
}
