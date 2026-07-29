"use server";

import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { writeAdminTournamentContextCookie } from "@/lib/services/admin-tournament-context-cookie";
import { ServiceError } from "@/lib/services/service-error";
import { requireTournamentById } from "@/lib/services/tournament";

export async function setAdminTournamentContextAction(
  tournamentId: string,
): Promise<ActionResult> {
  try {
    await requireAdminSession();

    if (!tournamentId) {
      throw new ServiceError("INVALID_INPUT", "Tournament is required.");
    }

    await requireTournamentById(tournamentId);
    await writeAdminTournamentContextCookie(tournamentId);
    revalidatePath("/admin", "layout");

    return actionSuccess("Admin tournament view updated.");
  } catch (error) {
    return mapAdminActionError(error, "Update tournament view failed");
  }
}
