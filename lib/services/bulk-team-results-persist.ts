import { eq, inArray, sql } from "drizzle-orm";

import * as schema from "@/lib/db/schema";
import { registrationEvents, teams } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import {
  scoreAuditEventType,
  scoreFieldsChanged,
  type BulkTeamResultsRow,
  type ResolvedBulkTeamResultsEntry,
} from "@/lib/services/team-results-support";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type BulkResultsDb = NodePgDatabase<typeof schema>;
type BulkResultsTx = Parameters<Parameters<BulkResultsDb["transaction"]>[0]>[0];

async function recordBulkTeamResultsAuditEvents(
  tx: BulkResultsTx,
  input: {
    tournamentId: string;
    adminUserId: string;
    changes: ResolvedBulkTeamResultsEntry[];
    previousByTeamId: Map<string, BulkTeamResultsRow>;
  },
): Promise<void> {
  for (const change of input.changes) {
    const previous = input.previousByTeamId.get(change.teamId);

    if (!previous) {
      continue;
    }

    if (previous.finishingPlacement !== change.finishingPlacement) {
      await tx.insert(registrationEvents).values({
        tournamentId: input.tournamentId,
        teamId: change.teamId,
        adminUserId: input.adminUserId,
        eventType:
          change.finishingPlacement === null
            ? AUDIT_EVENT_TYPES.teamFinishingPlacementCleared
            : AUDIT_EVENT_TYPES.teamFinishingPlacementSet,
        metadata: { finishingPlacement: change.finishingPlacement },
      });
    }

    if (
      scoreFieldsChanged(previous, {
        scoreRelativeToPar: change.scoreRelativeToPar,
        scoreTotalStrokes: change.scoreTotalStrokes,
      })
    ) {
      const eventType = scoreAuditEventType(previous, change);

      await tx.insert(registrationEvents).values({
        tournamentId: input.tournamentId,
        teamId: change.teamId,
        adminUserId: input.adminUserId,
        eventType: AUDIT_EVENT_TYPES[eventType],
        metadata: {
          scoreRelativeToPar: change.scoreRelativeToPar,
          scoreTotalStrokes: change.scoreTotalStrokes,
        },
      });
    }
  }
}

export async function persistBulkTeamResultsChanges(
  tx: BulkResultsTx,
  input: {
    tournamentId: string;
    adminUserId: string;
    changes: ResolvedBulkTeamResultsEntry[];
    previousByTeamId: Map<string, BulkTeamResultsRow>;
  },
): Promise<void> {
  for (const change of input.changes) {
    await tx
      .update(teams)
      .set({
        finishingPlacement: change.finishingPlacement,
        scoreRelativeToPar: change.scoreRelativeToPar,
        scoreTotalStrokes: change.scoreTotalStrokes,
        updatedAt: sql`now()`,
      })
      .where(eq(teams.id, change.teamId));
  }

  await recordBulkTeamResultsAuditEvents(tx, input);
}

export async function verifyBulkTeamResultsChanges(
  tx: BulkResultsTx,
  changes: ResolvedBulkTeamResultsEntry[],
): Promise<void> {
  const updatedRows = await tx
    .select({
      id: teams.id,
      finishingPlacement: teams.finishingPlacement,
      scoreRelativeToPar: teams.scoreRelativeToPar,
      scoreTotalStrokes: teams.scoreTotalStrokes,
    })
    .from(teams)
    .where(
      inArray(
        teams.id,
        changes.map((change) => change.teamId),
      ),
    );

  for (const change of changes) {
    const updated = updatedRows.find((row) => row.id === change.teamId);

    if (
      !updated ||
      updated.finishingPlacement !== change.finishingPlacement ||
      updated.scoreRelativeToPar !== change.scoreRelativeToPar ||
      updated.scoreTotalStrokes !== change.scoreTotalStrokes
    ) {
      throw new Error("Bulk team results save failed.");
    }
  }
}
