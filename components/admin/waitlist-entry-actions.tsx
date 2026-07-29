"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { WaitlistActionButtons } from "@/components/admin/waitlist-action-buttons";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import {
  promoteWaitlistEntryAction,
  removeWaitlistEntryAction,
} from "@/lib/actions/admin-waitlist";

export function WaitlistEntryActions({
  waitlistEntryId,
  readOnlyReason,
}: {
  waitlistEntryId: string;
  readOnlyReason?: string;
}) {
  const { message, isPending, runAction } = useAdminActionResult();
  const disabled = Boolean(readOnlyReason);
  const displayMessage =
    disabled && readOnlyReason
      ? { tone: "error" as const, text: readOnlyReason }
      : message;

  return (
    <div className="flex flex-col gap-2">
      <WaitlistActionButtons
        disabled={disabled}
        isPending={isPending}
        onPromote={() => runAction(() => promoteWaitlistEntryAction(waitlistEntryId))}
        onRemove={() => runAction(() => removeWaitlistEntryAction(waitlistEntryId))}
      />
      <AdminActionMessage message={displayMessage} />
    </div>
  );
}
