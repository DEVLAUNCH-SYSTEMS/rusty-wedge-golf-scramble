"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { parseCreateTournamentFormData } from "@/lib/actions/parse-tournament-create-form";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { createTournament } from "@/lib/services/tournament-create";

export async function createTournamentAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const input = parseCreateTournamentFormData(formData);
    const created = await createTournament(input);

    return actionSuccess(
      `Created ${created.year} tournament draft (${created.slug}).`,
    );
  } catch (error) {
    return mapAdminActionError(error, "Create tournament failed");
  }
}
