"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import {
  adminButtonClassName,
  adminDangerButtonClassName,
} from "@/components/admin/admin-form-styles";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import {
  promoteWaitlistEntryAction,
  removeWaitlistEntryAction,
} from "@/lib/actions/admin-waitlist";

export function WaitlistEntryActions({ waitlistEntryId }: { waitlistEntryId: string }) {
  const { message, isPending, runAction } = useAdminActionResult();
  const promote = () => runAction(() => promoteWaitlistEntryAction(waitlistEntryId));
  const remove = () => runAction(() => removeWaitlistEntryAction(waitlistEntryId));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={isPending} className={adminButtonClassName} onClick={promote}>
          {isPending ? "Working…" : "Promote"}
        </button>
        <button type="button" disabled={isPending} className={adminDangerButtonClassName} onClick={remove}>
          Remove
        </button>
      </div>
      <AdminActionMessage message={message} />
    </div>
  );
}
