import { and, count, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, tournaments } from "@/lib/db/schema";

export async function getConfirmedCount(tournamentId: string): Promise<number> {
  const db = getDb();
  const rows = await db
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

export async function hasRegistrationCapacity(
  tournamentId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({
      limit: tournaments.confirmedCapacityLimit,
      confirmed: count(registrations.id),
    })
    .from(tournaments)
    .leftJoin(
      registrations,
      and(
        eq(registrations.tournamentId, tournaments.id),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    )
    .where(eq(tournaments.id, tournamentId))
    .groupBy(tournaments.id, tournaments.confirmedCapacityLimit)
    .limit(1);

  const row = rows[0];

  if (!row) {
    return false;
  }

  return Number(row.confirmed) < row.limit;
}
