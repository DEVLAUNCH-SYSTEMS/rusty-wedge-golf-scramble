import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { ServiceError } from "@/lib/services/service-error";
import { registrationEnabledFromLifecycle } from "@/lib/services/tournament-lifecycle";
import { assertLifecycleTransition } from "@/lib/services/tournament-lifecycle-transitions";

import type { Tournament } from "@/lib/services/tournament";
import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type TransitionTournamentLifecycleInput = {
  tournamentId: string;
  toStatus: TournamentLifecycleStatus;
  adminUserId: string;
};

type LifecycleDb = NodePgDatabase<typeof schema>;
type LifecycleTx = Parameters<Parameters<LifecycleDb["transaction"]>[0]>[0];

async function lockTournament(
  tx: LifecycleTx,
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

function lifecycleUpdateValues(
  from: TournamentLifecycleStatus,
  to: TournamentLifecycleStatus,
  adminUserId: string,
) {
  assertLifecycleTransition(from, to);

  const base = {
    lifecycleStatus: to,
    registrationEnabled: registrationEnabledFromLifecycle(to),
    updatedAt: sql`now()`,
  };

  if (to === "archived") {
    return {
      ...base,
      isActive: false,
      archivedAt: sql`now()`,
      archivedByAdminId: adminUserId,
    };
  }

  if (from === "archived") {
    return {
      ...base,
      archivedAt: null,
      archivedByAdminId: null,
    };
  }

  return base;
}

async function recordLifecycleChangedEvent(
  tx: LifecycleTx,
  input: {
    tournamentId: string;
    adminUserId: string;
    fromStatus: TournamentLifecycleStatus;
    toStatus: TournamentLifecycleStatus;
  },
): Promise<void> {
  await tx.insert(registrationEvents).values({
    tournamentId: input.tournamentId,
    adminUserId: input.adminUserId,
    eventType: AUDIT_EVENT_TYPES.tournamentLifecycleChanged,
    metadata: {
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
    },
  });
}

async function runLifecycleTransition(
  tx: LifecycleTx,
  input: TransitionTournamentLifecycleInput,
): Promise<Tournament> {
  const tournament = await lockTournament(tx, input.tournamentId);

  if (!tournament) {
    throw new ServiceError("TOURNAMENT_NOT_FOUND", "Tournament not found.");
  }

  const fromStatus = tournament.lifecycleStatus;

  const rows = await tx
    .update(tournaments)
    .set(
      lifecycleUpdateValues(fromStatus, input.toStatus, input.adminUserId),
    )
    .where(eq(tournaments.id, input.tournamentId))
    .returning();

  const updated = rows[0];

  if (!updated) {
    throw new ServiceError("TOURNAMENT_NOT_FOUND", "Tournament not found.");
  }

  await recordLifecycleChangedEvent(tx, {
    tournamentId: input.tournamentId,
    adminUserId: input.adminUserId,
    fromStatus,
    toStatus: input.toStatus,
  });

  return updated;
}

export async function transitionTournamentLifecycle(
  input: TransitionTournamentLifecycleInput,
): Promise<Tournament> {
  const pool = getPgPool();
  const db = drizzle(pool, { schema });

  return db.transaction((tx) => runLifecycleTransition(tx, input));
}
