"use server";

import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { revalidatePublicTeamsSurfacesIfVisible } from "@/lib/actions/revalidate-public-teams-surfaces";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { setTeamResults } from "@/lib/services/team-finishing-placement";
import { parseTeamResultsFromFormData } from "@/lib/validation/team-results-form";

export async function setTeamResultsAction(
  teamId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const input = parseTeamResultsFromFormData(formData);
    const admin = await requireAdminSession();
    await setTeamResults(admin, teamId, input);

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${teamId}`);
    await revalidatePublicTeamsSurfacesIfVisible();

    return actionSuccess("Team results saved.");
  } catch (error) {
    return mapAdminActionError(error, "Team results action failed");
  }
}
