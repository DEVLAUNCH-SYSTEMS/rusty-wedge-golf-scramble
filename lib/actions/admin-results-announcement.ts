"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import {
  buildSendResultsAnnouncementActionMessage,
  buildVerifyResultsAnnouncementActionMessage,
} from "@/lib/content/results-announcement-action-messages";
import { requireAdminSession } from "@/lib/services/admin-auth";
import {
  sendResultsAnnouncement,
  verifyResultsAnnouncementSend,
} from "@/lib/services/results-announcement-send";

function readConfirmAcknowledged(formData: FormData): boolean {
  return formData.get("confirmAcknowledged") === "yes";
}

function revalidateAdminTeamsPage(): void {
  revalidatePath("/admin/teams");
}

export async function sendResultsAnnouncementAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    if (!readConfirmAcknowledged(formData)) {
      return actionFailure(
        "Confirm that you understand this one-time email before sending.",
      );
    }

    const admin = await requireAdminSession();
    const result = await sendResultsAnnouncement(admin);
    revalidateAdminTeamsPage();

    if (result.status === "not_sent") {
      return actionFailure(buildSendResultsAnnouncementActionMessage(result));
    }

    return actionSuccess(buildSendResultsAnnouncementActionMessage(result));
  } catch (error) {
    return mapAdminActionError(error, "Results announcement send action failed");
  }
}

export async function verifyResultsAnnouncementSendAction(
  _formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const result = await verifyResultsAnnouncementSend(admin);
    revalidateAdminTeamsPage();

    if (result.status === "not_sent") {
      return actionFailure(buildVerifyResultsAnnouncementActionMessage(result));
    }

    return actionSuccess(buildVerifyResultsAnnouncementActionMessage(result));
  } catch (error) {
    return mapAdminActionError(error, "Results announcement verify action failed");
  }
}
