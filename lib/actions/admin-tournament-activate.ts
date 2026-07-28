"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";
import { activateTournament } from "@/lib/services/tournament-activate";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function assertActivateConfirmed(formData: FormData): void {
  if (readString(formData, "confirmAcknowledged") !== "yes") {
    throw new ServiceError(
      "CONFIRMATION_REQUIRED",
      "Confirm that you understand this changes the public site.",
    );
  }
}

export async function activateTournamentAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    assertActivateConfirmed(formData);

    const tournamentId = readString(formData, "tournamentId");

    if (!tournamentId) {
      throw new ServiceError("INVALID_INPUT", "Tournament is required.");
    }

    const activated = await activateTournament({
      tournamentId,
      adminUserId: admin.adminUserId,
    });

    return actionSuccess(
      `${activated.year} is now the active tournament on the public site.`,
    );
  } catch (error) {
    return mapAdminActionError(error, "Activate tournament failed");
  }
}
