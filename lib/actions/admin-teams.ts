"use server";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { requireAdminSession } from "@/lib/services/admin-auth";
import {
  assignPlayerToTeam,
  createTeam,
  removePlayerFromTeam,
} from "@/lib/services/teams";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createTeamAction(formData: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const name = readString(formData, "name");
    const team = await createTeam(name, admin);

    return actionSuccess(`Team "${team.name}" created.`);
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
    return actionSuccess("Player removed from team.");
  } catch (error) {
    return mapAdminActionError(error, "Admin team action failed");
  }
}
