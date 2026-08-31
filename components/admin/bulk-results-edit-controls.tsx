"use client";

import { AdminActionSubmitButton } from "@/components/admin/admin-action-submit-button";
import { adminSecondaryButtonClassName } from "@/components/admin/admin-form-styles";
import {
  BULK_RESULTS_CANCEL_LABEL,
  BULK_RESULTS_SAVE_LABEL,
  BULK_RESULTS_SAVE_PENDING_LABEL,
} from "@/lib/content/finishing-placement-admin-copy";

function BulkResultsCancelButton({
  isPending,
  onCancel,
}: {
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <button
      type="button"
      className={adminSecondaryButtonClassName}
      disabled={isPending}
      onClick={onCancel}
    >
      {BULK_RESULTS_CANCEL_LABEL}
    </button>
  );
}

export function BulkResultsSaveCancelButtons({
  isPending,
  onCancel,
}: {
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <AdminActionSubmitButton
        danger={false}
        isPending={isPending}
        disabled={false}
        submitLabel={BULK_RESULTS_SAVE_LABEL}
        pendingLabel={BULK_RESULTS_SAVE_PENDING_LABEL}
      />
      <BulkResultsCancelButton isPending={isPending} onCancel={onCancel} />
    </div>
  );
}
