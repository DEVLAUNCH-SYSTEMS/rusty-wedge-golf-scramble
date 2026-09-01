import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { teams } from "@/lib/db/schema";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import {
  persistBulkTeamResultsChanges,
  verifyBulkTeamResultsChanges,
} from "@/lib/services/bulk-team-results-persist";
import {
  normalizePlacementInput,
  resolveOptionalScoreRelativeInput,
  resolveOptionalScoreStrokesInput,
  type BulkTeamResultsRow,
  type ResolvedBulkTeamResultsEntry,
} from "@/lib/services/team-results-support";
import { assertTournamentWritable } from "@/lib/services/tournament";
import { assertFinishingPlacementMutationAllowed } from "@/lib/services/tournament-results-lifecycle";
import {
  assertCompleteBulkTeamCoverage,
  type BulkTeamResultsEntry,
} from "@/lib/validation/bulk-team-finishing-placement";

import type { AdminSession } from "@/lib/services/admin-auth";

export type SetBulkTeamFinishingPlacementsResult = {
  updatedCount: number;
};

function resolveBulkEntry(
  entry: BulkTeamResultsEntry,
  current: BulkTeamResultsRow,
): ResolvedBulkTeamResultsEntry {
  return {
    teamId: entry.teamId,
    id: entry.teamId,
    finishingPlacement: normalizePlacementInput(entry.finishingPlacement),
    scoreRelativeToPar: resolveOptionalScoreRelativeInput(
      entry.scoreRelativeToPar,
      current.scoreRelativeToPar,
    ),
    scoreTotalStrokes: resolveOptionalScoreStrokesInput(
      entry.scoreTotalStrokes,
      current.scoreTotalStrokes,
    ),
  };
}

function normalizeBulkEntries(
  tournamentTeams: BulkTeamResultsRow[],
  entries: BulkTeamResultsEntry[],
): ResolvedBulkTeamResultsEntry[] {
  const currentByTeamId = new Map(
    tournamentTeams.map((team) => [team.id, team]),
  );

  return entries.map((entry) => {
    const current = currentByTeamId.get(entry.teamId);

    if (!current) {
      throw new Error("Bulk team results entry missing tournament team.");
    }

    return resolveBulkEntry(entry, current);
  });
}

function resolveResultChanges(
  tournamentTeams: BulkTeamResultsRow[],
  entries: ResolvedBulkTeamResultsEntry[],
): ResolvedBulkTeamResultsEntry[] {
  const currentByTeamId = new Map(
    tournamentTeams.map((team) => [team.id, team]),
  );

  return entries.filter((entry) => {
    const current = currentByTeamId.get(entry.teamId);

    if (!current) {
      return false;
    }

    return (
      current.finishingPlacement !== entry.finishingPlacement ||
      current.scoreRelativeToPar !== entry.scoreRelativeToPar ||
      current.scoreTotalStrokes !== entry.scoreTotalStrokes
    );
  });
}

export async function setBulkTeamFinishingPlacements(
  admin: AdminSession,
  entries: BulkTeamResultsEntry[],
): Promise<SetBulkTeamFinishingPlacementsResult> {
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
      scoreRelativeToPar: teams.scoreRelativeToPar,
      scoreTotalStrokes: teams.scoreTotalStrokes,
    })
    .from(teams)
    .where(eq(teams.tournamentId, context.tournament.id));

  assertCompleteBulkTeamCoverage(
    tournamentTeams.map((team) => team.id),
    entries,
  );

  const normalizedEntries = normalizeBulkEntries(tournamentTeams, entries);
  const changes = resolveResultChanges(tournamentTeams, normalizedEntries);

  if (changes.length === 0) {
    return { updatedCount: 0 };
  }

  const previousByTeamId = new Map(
    tournamentTeams.map((team) => [team.id, team]),
  );

  await db.transaction(async (tx) => {
    await persistBulkTeamResultsChanges(tx, {
      tournamentId: context.tournament.id,
      adminUserId: admin.adminUserId,
      changes,
      previousByTeamId,
    });
    await verifyBulkTeamResultsChanges(tx, changes);
  });

  return { updatedCount: changes.length };
}
