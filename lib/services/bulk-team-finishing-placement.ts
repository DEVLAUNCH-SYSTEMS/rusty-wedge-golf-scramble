import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, teams } from "@/lib/db/schema";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { assertTournamentWritable } from "@/lib/services/tournament";
import { assertFinishingPlacementMutationAllowed } from "@/lib/services/tournament-results-lifecycle";
import {
  assertCompleteBulkTeamCoverage,
  type BulkTeamFinishingPlacementEntry,
} from "@/lib/validation/bulk-team-finishing-placement";
import { parseTeamFinishingPlacementInput } from "@/lib/validation/team-finishing-placement";

import type { AdminSession } from "@/lib/services/admin-auth";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type BulkPlacementDb = NodePgDatabase<typeof schema>;
type BulkPlacementTx = Parameters<Parameters<BulkPlacementDb["transaction"]>[0]>[0];

export type SetBulkTeamFinishingPlacementsResult = {
  updatedCount: number;
};

type TeamPlacementRow = {
  id: string;
  finishingPlacement: number | null;
};

function resolvePlacementChanges(
  tournamentTeams: TeamPlacementRow[],
  entries: BulkTeamFinishingPlacementEntry[],
): BulkTeamFinishingPlacementEntry[] {
  const currentByTeamId = new Map(
    tournamentTeams.map((team) => [team.id, team.finishingPlacement]),
  );

  return entries.filter(
    (entry) => currentByTeamId.get(entry.teamId) !== entry.finishingPlacement,
  );
}

async function persistBulkPlacementChanges(
  tx: BulkPlacementTx,
  input: {
    tournamentId: string;
    adminUserId: string;
    changes: BulkTeamFinishingPlacementEntry[];
  },
): Promise<void> {
  for (const change of input.changes) {
    await tx
      .update(teams)
      .set({
        finishingPlacement: change.finishingPlacement,
        updatedAt: sql`now()`,
      })
      .where(eq(teams.id, change.teamId));
  }

  for (const change of input.changes) {
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
}

function normalizeBulkEntries(
  entries: BulkTeamFinishingPlacementEntry[],
): BulkTeamFinishingPlacementEntry[] {
  return entries.map((entry) => ({
    teamId: entry.teamId,
    finishingPlacement:
      entry.finishingPlacement === null
        ? null
        : parseTeamFinishingPlacementInput(entry.finishingPlacement),
  }));
}

export async function setBulkTeamFinishingPlacements(
  admin: AdminSession,
  entries: BulkTeamFinishingPlacementEntry[],
): Promise<SetBulkTeamFinishingPlacementsResult> {
  const normalizedEntries = normalizeBulkEntries(entries);
  const context = await resolveAdminTournamentContext();
  assertTournamentWritable(context.tournament);
  assertFinishingPlacementMutationAllowed({
    lifecycleStatus: context.tournament.lifecycleStatus,
    isViewingActiveTournament: context.isViewingActiveTournament,
  });

  const db = drizzle(getPgPool(), { schema });
  const tournamentTeams = await db
    .select({
      id: teams.id,
      finishingPlacement: teams.finishingPlacement,
    })
    .from(teams)
    .where(eq(teams.tournamentId, context.tournament.id));

  assertCompleteBulkTeamCoverage(
    tournamentTeams.map((team) => team.id),
    normalizedEntries,
  );

  const changes = resolvePlacementChanges(tournamentTeams, normalizedEntries);

  if (changes.length === 0) {
    return { updatedCount: 0 };
  }

  await db.transaction(async (tx) => {
    await persistBulkPlacementChanges(tx, {
      tournamentId: context.tournament.id,
      adminUserId: admin.adminUserId,
      changes,
    });

    const updatedRows = await tx
      .select({
        id: teams.id,
        finishingPlacement: teams.finishingPlacement,
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

      if (!updated || updated.finishingPlacement !== change.finishingPlacement) {
        throw new Error("Bulk finishing placement save failed.");
      }
    }
  });

  return { updatedCount: changes.length };
}
