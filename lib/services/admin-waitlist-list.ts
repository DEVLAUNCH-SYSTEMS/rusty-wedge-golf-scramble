import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";
import { requireActiveTournament } from "@/lib/services/tournament";

export type AdminWaitlistEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skillLevel: string;
  preferredPlayers: string | null;
  notes: string | null;
  createdAt: Date;
};

export async function listActiveWaitlistEntries(): Promise<AdminWaitlistEntry[]> {
  const tournament = await requireActiveTournament();
  const db = getDb();

  return db
    .select({
      id: waitlistEntries.id,
      firstName: waitlistEntries.firstName,
      lastName: waitlistEntries.lastName,
      email: waitlistEntries.email,
      phone: waitlistEntries.phone,
      skillLevel: waitlistEntries.skillLevel,
      preferredPlayers: waitlistEntries.preferredPlayers,
      notes: waitlistEntries.notes,
      createdAt: waitlistEntries.createdAt,
    })
    .from(waitlistEntries)
    .where(
      and(
        eq(waitlistEntries.tournamentId, tournament.id),
        eq(waitlistEntries.status, "active"),
      ),
    )
    .orderBy(asc(waitlistEntries.createdAt));
}
