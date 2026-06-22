import { and, count, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";


import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, registrations, tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type ConfirmRegistrationInput = {
  registrationId: string;
  tournamentId: string;
  adminUserId: string;
};

export type ConfirmRegistrationResult =
  | { ok: true }
  | { ok: false; confirmedCount: number; capacityLimit: number };

type CapacityDb = NodePgDatabase<typeof schema>;
type CapacityTx = Parameters<Parameters<CapacityDb["transaction"]>[0]>[0];

async function countConfirmedInTransaction(
  tx: CapacityTx,
  tournamentId: string,
): Promise<number> {
  const rows = await tx
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    );

  return Number(rows[0]?.total ?? 0);
}

async function lockTournament(
  tx: CapacityTx,
  tournamentId: string,
): Promise<{ capacityLimit: number } | null> {
  const rows = await tx
    .select({ capacityLimit: tournaments.confirmedCapacityLimit })
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId))
    .for("update");

  return rows[0] ?? null;
}

async function insertAuditEvent(
  tx: CapacityTx,
  input: {
    tournamentId: string;
    registrationId: string;
    adminUserId: string;
    eventType: string;
    metadata: Record<string, unknown>;
  },
): Promise<void> {
  await tx.insert(registrationEvents).values({
    tournamentId: input.tournamentId,
    registrationId: input.registrationId,
    adminUserId: input.adminUserId,
    eventType: input.eventType,
    metadata: input.metadata,
  });
}
async function markRegistrationConfirmed(
  tx: CapacityTx,
  input: ConfirmRegistrationInput,
): Promise<void> {
  await tx
    .update(registrations)
    .set({
      registrationStatus: "confirmed",
      paymentStatus: "verified",
      verifiedAt: sql`now()`,
      verifiedByAdminId: input.adminUserId,
      updatedAt: sql`now()`,
    })
    .where(eq(registrations.id, input.registrationId));
}

async function runCapacityConfirmation(
  tx: CapacityTx,
  input: ConfirmRegistrationInput,
): Promise<ConfirmRegistrationResult> {
  const tournament = await lockTournament(tx, input.tournamentId);

  if (!tournament) {
    throw new Error("Tournament not found for capacity confirmation.");
  }

  const confirmedCount = await countConfirmedInTransaction(
    tx,
    input.tournamentId,
  );

  if (confirmedCount >= tournament.capacityLimit) {
    await insertAuditEvent(tx, {
      tournamentId: input.tournamentId,
      registrationId: input.registrationId,
      adminUserId: input.adminUserId,
      eventType: AUDIT_EVENT_TYPES.verifyBlockedCapacity,
      metadata: {
        confirmedCount,
        capacityLimit: tournament.capacityLimit,
      },
    });

    return {
      ok: false,
      confirmedCount,
      capacityLimit: tournament.capacityLimit,
    };
  }

  await markRegistrationConfirmed(tx, input);

  await insertAuditEvent(tx, {
    tournamentId: input.tournamentId,
    registrationId: input.registrationId,
    adminUserId: input.adminUserId,
    eventType: AUDIT_EVENT_TYPES.paymentVerified,
    metadata: {
      confirmedCountBefore: confirmedCount,
      capacityLimit: tournament.capacityLimit,
    },
  });

  return { ok: true };
}

export async function confirmRegistrationIfCapacity(
  input: ConfirmRegistrationInput,
): Promise<ConfirmRegistrationResult> {
  const pool = getPgPool();
  const db = drizzle(pool, { schema });

  return db.transaction((tx) => runCapacityConfirmation(tx, input));
}
