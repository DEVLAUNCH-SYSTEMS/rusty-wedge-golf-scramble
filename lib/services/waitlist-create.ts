import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";
import {
  assertWaitlistEmailAvailable,
  insertWaitlistRecord,
} from "@/lib/services/player-create-shared";
import {
  PUBLIC_ERROR_MESSAGE,
  ServiceError,
} from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";
import { normalizePlayerEmail } from "@/lib/validation/player-profile";

import type { PublicCreateTournament } from "@/lib/services/tournament";
import type { SubmitWaitlistInput } from "@/lib/validation/forms";

export async function findWaitlistEntryById(waitlistEntryId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.id, waitlistEntryId))
    .limit(1);

  return rows[0] ?? null;
}

export async function createWaitlistEntry(
  input: SubmitWaitlistInput,
  tournament: PublicCreateTournament,
) {
  if (!tournament.registrationEnabled) {
    throw new ServiceError("REGISTRATION_CLOSED", PUBLIC_ERROR_MESSAGE);
  }

  const email = normalizePlayerEmail(input.email);

  await assertWaitlistEmailAvailable(tournament.id, email);

  return insertWaitlistRecord({
    tournamentId: tournament.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    phone: input.phone,
    skillLevel: input.skillLevel,
    preferredPlayers: input.preferredPlayers,
    notes: input.notes,
    createdSource: "public",
  });
}

export async function removeWaitlistEntry(waitlistEntryId: string) {
  const tournament = await requireActiveTournament();
  const entry = await findWaitlistEntryById(waitlistEntryId);

  if (!entry) {
    throw new ServiceError("NOT_FOUND", "Waitlist entry not found.");
  }

  if (entry.tournamentId !== tournament.id) {
    throw new ServiceError(
      "TOURNAMENT_SCOPE_MISMATCH",
      "Record is outside the active tournament.",
    );
  }

  if (entry.status !== "active") {
    throw new ServiceError("INVALID_STATUS", "Waitlist entry is not active.");
  }

  const db = getDb();
  await db
    .update(waitlistEntries)
    .set({ status: "removed", updatedAt: sql`now()` })
    .where(eq(waitlistEntries.id, waitlistEntryId));
}
