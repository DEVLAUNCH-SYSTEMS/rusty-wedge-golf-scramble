"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { revalidatePublicLandingAndTeamsIfPublished } from "@/lib/actions/revalidate-public-teams-surfaces";
import { formatAdminTeamLabel } from "@/lib/format/team-display";
import { requireAdminSession } from "@/lib/services/admin-auth";
import {
  assignPlayerToTeam,
  createTeam,
  deleteTeam,
  removePlayerFromTeam,
} from "@/lib/services/teams";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createTeamAction(_formData: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const team = await createTeam(admin);

    await revalidatePublicLandingAndTeamsIfPublished();

    return actionSuccess(
      `${formatAdminTeamLabel({ teamNumber: team.teamNumber, name: team.name })} created.`,
    );
  } catch (error) {
    return mapAdminActionError(error, "Admin team action failed");
  }
}

export async function assignPlayerToTeamAction(
  teamId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const registrationId = readString(formData, "registrationId");

    if (!registrationId) {
      return actionFailure("Select a player to assign.");
    }

    await assignPlayerToTeam(teamId, registrationId, admin);
    await revalidatePublicLandingAndTeamsIfPublished();

    return actionSuccess("Player assigned to team.");
  } catch (error) {
    return mapAdminActionError(error, "Admin team action failed");
  }
}

export async function removePlayerFromTeamAction(
  teamId: string,
  registrationId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    await removePlayerFromTeam(teamId, registrationId, admin);
    await revalidatePublicLandingAndTeamsIfPublished();

    return actionSuccess("Player removed from team.");
  } catch (error) {
    return mapAdminActionError(error, "Admin team action failed");
  }
}

export async function deleteTeamAction(formData: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const teamId = readString(formData, "teamId");

    if (!teamId) {
      return actionFailure("Team is required.");
    }

    if (readString(formData, "confirmAcknowledged") !== "yes") {
      return actionFailure("Confirm that you understand this action before deleting.");
    }

    const deleted = await deleteTeam(teamId, admin);

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${teamId}`);
    await revalidatePublicLandingAndTeamsIfPublished();

    return actionSuccess(
      deleted.memberCount > 0
        ? `Team "${deleted.teamName}" deleted. Its players are now unassigned.`
        : `Team "${deleted.teamName}" deleted.`,
    );
  } catch (error) {
    return mapAdminActionError(error, "Admin team action failed");
  }
}
