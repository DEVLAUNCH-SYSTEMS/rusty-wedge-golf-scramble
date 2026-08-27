"use server";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { revalidatePublicLandingAndTeams } from "@/lib/actions/revalidate-public-teams-surfaces";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { hideTeams, publishTeams } from "@/lib/services/teams-publication";

function readConfirmAcknowledged(formData: FormData): boolean {
  return formData.get("confirmAcknowledged") === "yes";
}

export async function publishTeamsAction(formData: FormData): Promise<ActionResult> {
  try {
    if (!readConfirmAcknowledged(formData)) {
      return actionFailure(
        "Confirm that you understand this action before publishing.",
      );
    }

    const admin = await requireAdminSession();
    await publishTeams(admin);
    await revalidatePublicLandingAndTeams();

    return actionSuccess("Teams published.");
  } catch (error) {
    return mapAdminActionError(error, "Teams publication action failed");
  }
}

export async function hideTeamsAction(formData: FormData): Promise<ActionResult> {
  try {
    if (!readConfirmAcknowledged(formData)) {
      return actionFailure(
        "Confirm that you understand this action before hiding teams.",
      );
    }

    const admin = await requireAdminSession();
    await hideTeams(admin);
    await revalidatePublicLandingAndTeams();

    return actionSuccess("Teams hidden.");
  } catch (error) {
    return mapAdminActionError(error, "Teams publication action failed");
  }
}
