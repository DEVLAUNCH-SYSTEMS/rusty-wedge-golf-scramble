import { and, eq, ne } from "drizzle-orm";

import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { tournaments } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type RegistrationOpenRuleTx = Parameters<
  Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]
>[0];

export function rejectRegistrationOpenConflict(
  conflictingTournamentId: string | null | undefined,
): void {
  if (!conflictingTournamentId) {
    return;
  }

  throw new ServiceError(
    "REGISTRATION_ALREADY_OPEN",
    "Another tournament already has registration open. Close it before opening registration for this event.",
  );
}

export async function findOtherRegistrationOpenTournamentId(
  tx: RegistrationOpenRuleTx,
  tournamentId: string,
): Promise<string | null> {
  const rows = await tx
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(
      and(
        eq(tournaments.lifecycleStatus, "registration_open"),
        ne(tournaments.id, tournamentId),
      ),
    )
    .for("update")
    .limit(1);

  return rows[0]?.id ?? null;
}

export async function assertRegistrationOpenCreateAllowed(): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.lifecycleStatus, "registration_open"))
    .limit(1);

  rejectRegistrationOpenConflict(rows[0]?.id);
}

export async function assertRegistrationOpenTransitionAllowed(
  tx: RegistrationOpenRuleTx,
  tournamentId: string,
): Promise<void> {
  const conflictingId = await findOtherRegistrationOpenTournamentId(
    tx,
    tournamentId,
  );

  rejectRegistrationOpenConflict(conflictingId);
}
