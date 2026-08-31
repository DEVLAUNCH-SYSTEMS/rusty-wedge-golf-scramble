"use server";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { revalidatePublicLandingAndTeams } from "@/lib/actions/revalidate-public-teams-surfaces";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { hideResults, publishResults } from "@/lib/services/results-publication";

function readConfirmAcknowledged(formData: FormData): boolean {
  return formData.get("confirmAcknowledged") === "yes";
}

export async function publishResultsAction(formData: FormData): Promise<ActionResult> {
  try {
    if (!readConfirmAcknowledged(formData)) {
      return actionFailure(
        "Confirm that you understand this action before publishing.",
      );
    }

    const admin = await requireAdminSession();
    await publishResults(admin);
    await revalidatePublicLandingAndTeams();

    return actionSuccess("Results published.");
  } catch (error) {
    return mapAdminActionError(error, "Results publication action failed");
  }
}

export async function hideResultsAction(formData: FormData): Promise<ActionResult> {
  try {
    if (!readConfirmAcknowledged(formData)) {
      return actionFailure(
        "Confirm that you understand this action before hiding results.",
      );
    }

    const admin = await requireAdminSession();
    await hideResults(admin);
    await revalidatePublicLandingAndTeams();

    return actionSuccess("Results hidden.");
  } catch (error) {
    return mapAdminActionError(error, "Results publication action failed");
  }
}
