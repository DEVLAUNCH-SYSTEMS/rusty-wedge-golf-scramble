import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import {
  scoreAuditEventType,
  scoreFieldsChanged,
  type TeamScoreValues,
} from "@/lib/services/team-results-support";

import type { AdminSession } from "@/lib/services/admin-auth";

export type TeamResultsInput = {
  finishingPlacement?: number | null;
  scoreRelativeToPar?: number | null;
  scoreTotalStrokes?: number | null;
};

export type ResolvedTeamResults = {
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
};

export function scoreFieldsPresent(input: TeamResultsInput): boolean {
  return (
    input.scoreRelativeToPar !== undefined || input.scoreTotalStrokes !== undefined
  );
}

export function resolveTeamResultsInput(
  team: typeof teams.$inferSelect,
  input: TeamResultsInput,
  normalize: {
    placement: (value: number | null) => number | null;
    scoreRelative: (value: number | null) => number | null;
    scoreStrokes: (value: number | null) => number | null;
  },
): ResolvedTeamResults {
  return {
    finishingPlacement:
      input.finishingPlacement !== undefined
        ? normalize.placement(input.finishingPlacement)
        : team.finishingPlacement,
    scoreRelativeToPar:
      input.scoreRelativeToPar !== undefined
        ? normalize.scoreRelative(input.scoreRelativeToPar)
        : team.scoreRelativeToPar,
    scoreTotalStrokes:
      input.scoreTotalStrokes !== undefined
        ? normalize.scoreStrokes(input.scoreTotalStrokes)
        : team.scoreTotalStrokes,
  };
}

export function teamResultsChanged(
  team: typeof teams.$inferSelect,
  resolved: ResolvedTeamResults,
  input: TeamResultsInput,
): boolean {
  const placementChanged =
    input.finishingPlacement !== undefined &&
    team.finishingPlacement !== resolved.finishingPlacement;
  const scoresChanged =
    scoreFieldsPresent(input) &&
    scoreFieldsChanged(team, {
      scoreRelativeToPar: resolved.scoreRelativeToPar,
      scoreTotalStrokes: resolved.scoreTotalStrokes,
    });

  return placementChanged || scoresChanged;
}

export async function persistTeamResultsUpdate(
  teamId: string,
  input: TeamResultsInput,
  resolved: ResolvedTeamResults,
): Promise<void> {
  const db = getDb();

  await db
    .update(teams)
    .set({
      ...(input.finishingPlacement !== undefined
        ? { finishingPlacement: resolved.finishingPlacement }
        : {}),
      ...(scoreFieldsPresent(input)
        ? {
            scoreRelativeToPar: resolved.scoreRelativeToPar,
            scoreTotalStrokes: resolved.scoreTotalStrokes,
          }
        : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(teams.id, teamId));
}

export async function recordTeamResultsAuditEvents(input: {
  admin: AdminSession;
  tournamentId: string;
  teamId: string;
  previousPlacement: number | null;
  resolved: ResolvedTeamResults;
  teamScoresBefore: TeamScoreValues;
  placementUpdates: boolean;
  scoreUpdates: boolean;
}): Promise<void> {
  if (
    input.placementUpdates &&
    input.previousPlacement !== input.resolved.finishingPlacement
  ) {
    await recordAuditEvent({
      tournamentId: input.tournamentId,
      teamId: input.teamId,
      adminUserId: input.admin.adminUserId,
      eventType:
        input.resolved.finishingPlacement === null
          ? AUDIT_EVENT_TYPES.teamFinishingPlacementCleared
          : AUDIT_EVENT_TYPES.teamFinishingPlacementSet,
      metadata: { finishingPlacement: input.resolved.finishingPlacement },
    });
  }

  if (
    input.scoreUpdates &&
    scoreFieldsChanged(input.teamScoresBefore, {
      scoreRelativeToPar: input.resolved.scoreRelativeToPar,
      scoreTotalStrokes: input.resolved.scoreTotalStrokes,
    })
  ) {
    const eventType = scoreAuditEventType(
      input.teamScoresBefore,
      input.resolved,
    );

    await recordAuditEvent({
      tournamentId: input.tournamentId,
      teamId: input.teamId,
      adminUserId: input.admin.adminUserId,
      eventType: AUDIT_EVENT_TYPES[eventType],
      metadata: {
        scoreRelativeToPar: input.resolved.scoreRelativeToPar,
        scoreTotalStrokes: input.resolved.scoreTotalStrokes,
      },
    });
  }
}
