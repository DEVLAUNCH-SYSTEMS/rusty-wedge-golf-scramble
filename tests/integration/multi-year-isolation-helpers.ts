import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db";
import { registrationEvents, registrations, tournaments } from "@/lib/db/schema";
import { requireActiveTournament } from "@/lib/services/tournament";
import { createTournament } from "@/lib/services/tournament-create";

import { insertRegistrationRow, reserveUniqueTestYear, uniqueTestEmail } from "./helpers";

import type { Tournament } from "@/lib/services/tournament";

export type MultiYearIsolationFixture = {
  active: Tournament;
  other: Tournament;
  activeEmail: string;
  otherEmail: string;
  otherRegistrationId: string;
};

function uniqueIsolationYear(): Promise<number> {
  return reserveUniqueTestYear();
}

export async function createMultiYearIsolationFixture(): Promise<MultiYearIsolationFixture> {
  const active = await requireActiveTournament();
  const year = await uniqueIsolationYear();
  const other = await createTournament({
    name: "Multi-Year Isolation Test",
    slug: `${year}-multi-year-${randomUUID()}`,
    year,
    eventDate: `${year}-06-01`,
    teeTime: "09:00",
    locationName: "Test Course",
    entryFeeCents: 8500,
    confirmedCapacityLimit: 68,
    venmoHandle: "@multiyear",
    lifecycleStatus: "draft",
  });

  const activeEmail = uniqueTestEmail("multi-year-active");
  const otherEmail = uniqueTestEmail("multi-year-other");

  await insertRegistrationRow({
    tournamentId: active.id,
    email: activeEmail,
    registrationStatus: "pending_review",
  });

  const otherRegistration = await insertRegistrationRow({
    tournamentId: other.id,
    email: otherEmail,
    registrationStatus: "pending_review",
  });

  if (!otherRegistration?.id) {
    throw new Error("Unable to seed multi-year isolation registration.");
  }

  return {
    active,
    other,
    activeEmail,
    otherEmail,
    otherRegistrationId: otherRegistration.id,
  };
}

export async function deleteMultiYearIsolationTournament(tournamentId: string): Promise<void> {
  const db = getDb();

  await db.delete(registrations).where(eq(registrations.tournamentId, tournamentId));
  await db
    .delete(registrationEvents)
    .where(eq(registrationEvents.tournamentId, tournamentId));
  await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
}
