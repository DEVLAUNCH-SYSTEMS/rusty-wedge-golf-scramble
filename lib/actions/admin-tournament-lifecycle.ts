"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { parseTournamentLifecycleFormData } from "@/lib/actions/parse-tournament-lifecycle-form";
import { lifecycleStatusLabel } from "@/lib/format/tournament-lifecycle-display";
import { requireAdminSession } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";
import { requireTournamentById } from "@/lib/services/tournament";
import { assertLifecycleTransitionConfirm } from "@/lib/services/tournament-lifecycle-confirm";
import { transitionTournamentLifecycle } from "@/lib/services/tournament-lifecycle-transition";
import { canTransitionLifecycle } from "@/lib/services/tournament-lifecycle-transitions";

import type { TournamentLifecycleFormInput } from "@/lib/actions/parse-tournament-lifecycle-form";
import type { Tournament } from "@/lib/services/tournament";

function assertAllowedLifecycleTransition(
  tournament: Pick<Tournament, "lifecycleStatus">,
  toStatus: TournamentLifecycleFormInput["toStatus"],
): void {
  if (!canTransitionLifecycle(tournament.lifecycleStatus, toStatus)) {
    throw new ServiceError(
      "INVALID_LIFECYCLE_TRANSITION",
      `Cannot transition tournament from ${tournament.lifecycleStatus} to ${toStatus}.`,
    );
  }
}

async function runLifecycleTransitionAction(
  formData: FormData,
  adminUserId: string,
) {
  const input = parseTournamentLifecycleFormData(formData);
  const tournament = await requireTournamentById(input.tournamentId);

  assertAllowedLifecycleTransition(tournament, input.toStatus);
  assertLifecycleTransitionConfirm({
    fromStatus: tournament.lifecycleStatus,
    toStatus: input.toStatus,
    tournamentYear: tournament.year,
    confirmYear: input.confirmYear,
    confirmAcknowledged: input.confirmAcknowledged,
  });

  await transitionTournamentLifecycle({
    tournamentId: input.tournamentId,
    toStatus: input.toStatus,
    adminUserId,
  });

  return lifecycleStatusLabel(input.toStatus);
}

export async function transitionTournamentLifecycleAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdminSession();
    const nextStatusLabel = await runLifecycleTransitionAction(
      formData,
      admin.adminUserId,
    );
    return actionSuccess(`Tournament updated to ${nextStatusLabel}.`);
  } catch (error) {
    return mapAdminActionError(error, "Tournament lifecycle action failed");
  }
}
