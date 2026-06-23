"use server";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";
import {
  promoteWaitlistEntry,
  removeWaitlistEntry,
} from "@/lib/services/waitlist";

function mapAdminActionError(error: unknown): ActionResult {
  if (error instanceof ServiceError) {
    return actionFailure(error.message);
  }

  console.error("Admin waitlist action failed:", error);
  return actionFailure("Unable to complete that action. Please try again.");
}

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
    return mapAdminActionError(error);
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
    return mapAdminActionError(error);
  }
}
