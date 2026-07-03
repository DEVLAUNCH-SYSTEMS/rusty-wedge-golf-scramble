"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { requireAdminSession } from "@/lib/services/admin-auth";
import {
  promoteWaitlistEntry,
  removeWaitlistEntry,
} from "@/lib/services/waitlist";

export async function promoteWaitlistEntryAction(
  waitlistEntryId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    await promoteWaitlistEntry(waitlistEntryId, admin);

    return actionSuccess(
      `Promoted to registration review. Open pending review to verify payment when ready.`,
    );
  } catch (error) {
    return mapAdminActionError(error, "Admin waitlist action failed");
  }
}

export async function removeWaitlistEntryAction(
  waitlistEntryId: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    await removeWaitlistEntry(waitlistEntryId);
    return actionSuccess("Waitlist entry removed.");
  } catch (error) {
    return mapAdminActionError(error, "Admin waitlist action failed");
  }
}
