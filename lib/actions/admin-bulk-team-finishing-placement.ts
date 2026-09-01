"use server";

import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { revalidatePublicTeamsSurfacesIfVisible } from "@/lib/actions/revalidate-public-teams-surfaces";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { setBulkTeamFinishingPlacements } from "@/lib/services/bulk-team-finishing-placement";
import { parseBulkFinishingPlacementsFromFormData } from "@/lib/validation/bulk-team-finishing-placement";

function bulkSaveSuccessMessage(updatedCount: number): string {
  if (updatedCount === 0) {
    return "No result changes to save.";
  }

  return `Saved ${updatedCount} result ${updatedCount === 1 ? "change" : "changes"}.`;
}

export async function saveBulkTeamFinishingPlacementsAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const entries = parseBulkFinishingPlacementsFromFormData(formData);
    const admin = await requireAdminSession();
    const result = await setBulkTeamFinishingPlacements(admin, entries);

    revalidatePath("/admin/teams");
    await revalidatePublicTeamsSurfacesIfVisible();

    return actionSuccess(bulkSaveSuccessMessage(result.updatedCount));
  } catch (error) {
    return mapAdminActionError(error, "Bulk finishing placement action failed");
  }
}
