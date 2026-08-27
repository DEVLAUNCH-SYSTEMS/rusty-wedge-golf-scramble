import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { requireAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { assertTournamentWritable } from "@/lib/services/tournament";

import type { AdminSession } from "@/lib/services/admin-auth";

export type TeamsPublicationResult = {
  tournamentId: string;
  teamsPublished: boolean;
};

async function persistTeamsPublished(
  tournamentId: string,
  published: boolean,
): Promise<void> {
  const db = getDb();

  await db
    .update(tournaments)
    .set({ teamsPublished: published, updatedAt: sql`now()` })
    .where(eq(tournaments.id, tournamentId));
}

export async function setTeamsPublished(
  admin: AdminSession,
  published: boolean,
): Promise<TeamsPublicationResult> {
  const tournament = await requireAdminTournamentContext();
  assertTournamentWritable(tournament);

  if (tournament.teamsPublished === published) {
    return { tournamentId: tournament.id, teamsPublished: published };
  }

  await persistTeamsPublished(tournament.id, published);

  await recordAuditEvent({
    tournamentId: tournament.id,
    adminUserId: admin.adminUserId,
    eventType: published
      ? AUDIT_EVENT_TYPES.teamsPublished
      : AUDIT_EVENT_TYPES.teamsUnpublished,
    metadata: { teamsPublished: published },
  });

  return { tournamentId: tournament.id, teamsPublished: published };
}

export async function publishTeams(
  admin: AdminSession,
): Promise<TeamsPublicationResult> {
  return setTeamsPublished(admin, true);
}

export async function hideTeams(
  admin: AdminSession,
): Promise<TeamsPublicationResult> {
  return setTeamsPublished(admin, false);
}
