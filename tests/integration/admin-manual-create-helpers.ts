import { and, count, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, tournaments } from "@/lib/db/schema";

export const adminManualCreateProfile = {
  firstName: "Admin",
  lastName: "Created",
  phone: "5095550188",
  skillLevel: "C" as const,
};

export async function countConfirmedRegistrations(
  tournamentId: string,
): Promise<number> {
  const rows = await getDb()
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

export async function setConfirmedCapacityLimit(
  tournamentId: string,
  limit: number,
): Promise<void> {
  await getDb()
    .update(tournaments)
    .set({ confirmedCapacityLimit: limit })
    .where(eq(tournaments.id, tournamentId));
}

export async function findRegistrationById(registrationId: string) {
  const rows = await getDb()
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findRegistrationByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(registrations)
    .where(eq(registrations.email, email))
    .limit(1);

  return rows[0] ?? null;
}
