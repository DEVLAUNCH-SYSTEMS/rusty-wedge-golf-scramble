"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { sendResultsAnnouncementSmokeTest } from "@/lib/services/results-announcement-smoke-test";

function readSmokeTestAcknowledged(formData: FormData): boolean {
  return formData.get("smokeTestAcknowledged") === "yes";
}

export async function sendResultsAnnouncementSmokeTestAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    if (!readSmokeTestAcknowledged(formData)) {
      return actionFailure("Confirm the smoke test send before continuing.");
    }

    const admin = await requireAdminSession();
    const result = await sendResultsAnnouncementSmokeTest(admin);
    revalidatePath("/admin/teams");

    if (result.kind === "failed") {
      return actionFailure(result.message);
    }

    return actionSuccess(result.message);
  } catch (error) {
    return mapAdminActionError(error, "Results announcement smoke test failed");
  }
}
