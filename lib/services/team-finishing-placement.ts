import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { ServiceError } from "@/lib/services/service-error";
import {
  persistTeamResultsUpdate,
  recordTeamResultsAuditEvents,
  resolveTeamResultsInput,
  scoreFieldsPresent,
  teamResultsChanged,
  type TeamResultsInput,
} from "@/lib/services/team-results-mutation";
import {
  normalizePlacementInput,
  normalizeScoreRelativeInput,
  normalizeScoreStrokesInput,
} from "@/lib/services/team-results-support";
import { assertTournamentScope, assertTournamentWritable } from "@/lib/services/tournament";
import { assertFinishingPlacementMutationAllowed } from "@/lib/services/tournament-results-lifecycle";

import type { AdminSession } from "@/lib/services/admin-auth";

export type { TeamResultsInput } from "@/lib/services/team-results-mutation";

export type SetTeamResultsResult = {
  teamId: string;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
};

export type SetTeamFinishingPlacementResult = Pick<
  SetTeamResultsResult,
  "teamId" | "finishingPlacement"
>;

const normalizers = {
  placement: normalizePlacementInput,
  scoreRelative: normalizeScoreRelativeInput,
  scoreStrokes: normalizeScoreStrokesInput,
};

function assertTeamResultsInputProvided(input: TeamResultsInput): void {
  if (
    input.finishingPlacement === undefined &&
    input.scoreRelativeToPar === undefined &&
    input.scoreTotalStrokes === undefined
  ) {
    throw new ServiceError("VALIDATION", "No result fields were provided to update.");
  }
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

export async function setTeamResults(
  admin: AdminSession,
  teamId: string,
  input: TeamResultsInput,
): Promise<SetTeamResultsResult> {
  assertTeamResultsInputProvided(input);
  const { context, team } = await requireTeamInAdminContext(teamId);
  const resolved = resolveTeamResultsInput(team, input, normalizers);

  if (!teamResultsChanged(team, resolved, input)) {
    return {
      teamId: team.id,
      finishingPlacement: team.finishingPlacement,
      scoreRelativeToPar: team.scoreRelativeToPar,
      scoreTotalStrokes: team.scoreTotalStrokes,
    };
  }

  await persistTeamResultsUpdate(team.id, input, resolved);
  await recordTeamResultsAuditEvents({
    admin,
    tournamentId: context.tournament.id,
    teamId: team.id,
    previousPlacement: team.finishingPlacement,
    resolved,
    teamScoresBefore: {
      scoreRelativeToPar: team.scoreRelativeToPar,
      scoreTotalStrokes: team.scoreTotalStrokes,
    },
    placementUpdates: input.finishingPlacement !== undefined,
    scoreUpdates: scoreFieldsPresent(input),
  });

  return {
    teamId: team.id,
    finishingPlacement: resolved.finishingPlacement,
    scoreRelativeToPar: resolved.scoreRelativeToPar,
    scoreTotalStrokes: resolved.scoreTotalStrokes,
  };
}

export async function setTeamFinishingPlacement(
  admin: AdminSession,
  teamId: string,
  placement: number | null,
): Promise<SetTeamFinishingPlacementResult> {
  const result = await setTeamResults(admin, teamId, {
    finishingPlacement: placement,
  });

  return {
    teamId: result.teamId,
    finishingPlacement: result.finishingPlacement,
  };
}
