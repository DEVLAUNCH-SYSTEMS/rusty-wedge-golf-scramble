import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { requireAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { assertTournamentWritable } from "@/lib/services/tournament";

import type { AdminSession } from "@/lib/services/admin-auth";

export type ResultsPublicationResult = {
  tournamentId: string;
  resultsPublished: boolean;
};

async function persistResultsPublished(
  tournamentId: string,
  published: boolean,
): Promise<void> {
  const db = getDb();

  await db
    .update(tournaments)
    .set({ resultsPublished: published, updatedAt: sql`now()` })
    .where(eq(tournaments.id, tournamentId));
}

export async function setResultsPublished(
  admin: AdminSession,
  published: boolean,
): Promise<ResultsPublicationResult> {
  const tournament = await requireAdminTournamentContext();
  assertTournamentWritable(tournament);

  if (tournament.resultsPublished === published) {
    return { tournamentId: tournament.id, resultsPublished: published };
  }

  await persistResultsPublished(tournament.id, published);

  await recordAuditEvent({
    tournamentId: tournament.id,
    adminUserId: admin.adminUserId,
    eventType: published
      ? AUDIT_EVENT_TYPES.resultsPublished
      : AUDIT_EVENT_TYPES.resultsUnpublished,
    metadata: { resultsPublished: published },
  });

  return { tournamentId: tournament.id, resultsPublished: published };
}

export async function publishResults(
  admin: AdminSession,
): Promise<ResultsPublicationResult> {
  return setResultsPublished(admin, true);
}

export async function hideResults(
  admin: AdminSession,
): Promise<ResultsPublicationResult> {
  return setResultsPublished(admin, false);
}
