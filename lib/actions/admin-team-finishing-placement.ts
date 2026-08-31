"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { revalidatePublicTeamsSurfacesIfVisible } from "@/lib/actions/revalidate-public-teams-surfaces";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { setTeamFinishingPlacement } from "@/lib/services/team-finishing-placement";

function readPlacement(formData: FormData): number | null {
  const raw = formData.get("finishingPlacement");

  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  return Number.parseInt(raw, 10);
}

export async function setTeamFinishingPlacementAction(
  teamId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const placement = readPlacement(formData);

    if (placement === null || Number.isNaN(placement)) {
      return actionFailure("Enter a finishing placement of at least 1.");
    }

    const admin = await requireAdminSession();
    await setTeamFinishingPlacement(admin, teamId, placement);

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${teamId}`);
    await revalidatePublicTeamsSurfacesIfVisible();

    return actionSuccess("Finishing placement saved.");
  } catch (error) {
    return mapAdminActionError(error, "Finishing placement action failed");
  }
}

export async function clearTeamFinishingPlacementAction(
  teamId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    await setTeamFinishingPlacement(admin, teamId, null);

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${teamId}`);
    await revalidatePublicTeamsSurfacesIfVisible();

    return actionSuccess("Finishing placement cleared.");
  } catch (error) {
    return mapAdminActionError(error, "Finishing placement action failed");
  }
}
