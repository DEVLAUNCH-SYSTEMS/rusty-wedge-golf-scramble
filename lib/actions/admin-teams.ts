"use server";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";
import {
  assignPlayerToTeam,
  createTeam,
  removePlayerFromTeam,
} from "@/lib/services/teams";

function mapAdminActionError(error: unknown): ActionResult {
  if (error instanceof ServiceError) {
    return actionFailure(error.message);
  }

  console.error("Admin team action failed:", error);
  return actionFailure("Unable to complete that action. Please try again.");
}

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
    return mapAdminActionError(error);
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
    return mapAdminActionError(error);
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
    return mapAdminActionError(error);
  }
}
