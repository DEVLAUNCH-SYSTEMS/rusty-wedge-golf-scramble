import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentWritable,
  type Tournament,
} from "@/lib/services/tournament";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type ActivateTournamentInput = {
  tournamentId: string;
  adminUserId: string;
};

type ActivateDb = NodePgDatabase<typeof schema>;
type ActivateTx = Parameters<Parameters<ActivateDb["transaction"]>[0]>[0];

async function lockTournament(
  tx: ActivateTx,
  tournamentId: string,
): Promise<Tournament | null> {
  const rows = await tx
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId))
    .for("update")
    .limit(1);

  return rows[0] ?? null;
}

async function lockActiveTournaments(tx: ActivateTx): Promise<Tournament[]> {
  return tx
    .select()
    .from(tournaments)
    .where(eq(tournaments.isActive, true))
    .for("update");
}

async function recordTournamentActivatedEvent(
  tx: ActivateTx,
  input: {
    tournamentId: string;
    adminUserId: string;
    previousActiveTournamentId: string | null;
  },
): Promise<void> {
  await tx.insert(registrationEvents).values({
    tournamentId: input.tournamentId,
    adminUserId: input.adminUserId,
    eventType: AUDIT_EVENT_TYPES.tournamentActivated,
    metadata: {
      previousActiveTournamentId: input.previousActiveTournamentId,
    },
  });
}

async function runActivateTournament(
  tx: ActivateTx,
  input: ActivateTournamentInput,
): Promise<Tournament> {
  const target = await lockTournament(tx, input.tournamentId);

  if (!target) {
    throw new ServiceError("TOURNAMENT_NOT_FOUND", "Tournament not found.");
  }

  assertTournamentWritable(target);

  if (target.isActive) {
    return target;
  }

  const previouslyActive = await lockActiveTournaments(tx);
  const previousActiveTournamentId = previouslyActive[0]?.id ?? null;

  await tx
    .update(tournaments)
    .set({ isActive: false, updatedAt: sql`now()` })
    .where(eq(tournaments.isActive, true));

  const rows = await tx
    .update(tournaments)
    .set({ isActive: true, updatedAt: sql`now()` })
    .where(eq(tournaments.id, input.tournamentId))
    .returning();

  const activated = rows[0];

  if (!activated) {
    throw new ServiceError("TOURNAMENT_NOT_FOUND", "Tournament not found.");
  }

  await recordTournamentActivatedEvent(tx, {
    tournamentId: input.tournamentId,
    adminUserId: input.adminUserId,
    previousActiveTournamentId,
  });

  return activated;
}

export async function activateTournament(
  input: ActivateTournamentInput,
): Promise<Tournament> {
  const pool = getPgPool();
  const db = drizzle(pool, { schema });

  return db.transaction((tx) => runActivateTournament(tx, input));
}
