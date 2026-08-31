import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { ServiceError } from "@/lib/services/service-error";
import { assertTournamentScope, assertTournamentWritable } from "@/lib/services/tournament";
import { assertFinishingPlacementMutationAllowed } from "@/lib/services/tournament-results-lifecycle";
import { parseTeamFinishingPlacementInput } from "@/lib/validation/team-finishing-placement";

import type { AdminSession } from "@/lib/services/admin-auth";

export type SetTeamFinishingPlacementResult = {
  teamId: string;
  finishingPlacement: number | null;
};

function normalizePlacementInput(
  placement: number | null,
): number | null {
  if (placement === null) {
    return null;
  }

  return parseTeamFinishingPlacementInput(placement);
}

async function requireTeamInAdminContext(teamId: string) {
  const context = await resolveAdminTournamentContext();
  assertTournamentWritable(context.tournament);
  assertFinishingPlacementMutationAllowed({
    lifecycleStatus: context.tournament.lifecycleStatus,
    isViewingActiveTournament: context.isViewingActiveTournament,
  });

  const db = getDb();
  const team = (
    await db.select().from(teams).where(eq(teams.id, teamId)).limit(1)
  )[0];

  if (!team) {
    throw new ServiceError("NOT_FOUND", "Team not found.");
  }

  assertTournamentScope(team.tournamentId, context.tournament.id);

  return { context, team };
}

export async function setTeamFinishingPlacement(
  admin: AdminSession,
  teamId: string,
  placement: number | null,
): Promise<SetTeamFinishingPlacementResult> {
  const normalizedPlacement = normalizePlacementInput(placement);
  const { context, team } = await requireTeamInAdminContext(teamId);

  if (team.finishingPlacement === normalizedPlacement) {
    return { teamId: team.id, finishingPlacement: normalizedPlacement };
  }

  const db = getDb();

  await db
    .update(teams)
    .set({
      finishingPlacement: normalizedPlacement,
      updatedAt: sql`now()`,
    })
    .where(eq(teams.id, team.id));

  await recordAuditEvent({
    tournamentId: context.tournament.id,
    teamId: team.id,
    adminUserId: admin.adminUserId,
    eventType:
      normalizedPlacement === null
        ? AUDIT_EVENT_TYPES.teamFinishingPlacementCleared
        : AUDIT_EVENT_TYPES.teamFinishingPlacementSet,
    metadata: { finishingPlacement: normalizedPlacement },
  });

  return { teamId: team.id, finishingPlacement: normalizedPlacement };
}
