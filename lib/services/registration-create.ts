import { sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import {
  hasActiveRegistrationEmail,
  hasActiveWaitlistEmail,
} from "@/lib/services/registration-queries";
import {
  PUBLIC_ERROR_MESSAGE,
  ServiceError,
} from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";

import type { SubmitRegistrationInput } from "@/lib/validation/forms";

export type CreateRegistrationInput = SubmitRegistrationInput & {
  paymentProofPath: string;
  paymentProofContentType: string;
};

async function assertRegistrationAllowed(
  tournamentId: string,
  email: string,
): Promise<void> {
  if (await hasActiveRegistrationEmail(tournamentId, email)) {
    throw new ServiceError("DUPLICATE_REGISTRATION", PUBLIC_ERROR_MESSAGE);
  }

  if (await hasActiveWaitlistEmail(tournamentId, email)) {
    throw new ServiceError("EMAIL_ON_WAITLIST", PUBLIC_ERROR_MESSAGE);
  }
}

export async function createPendingRegistration(
  input: CreateRegistrationInput,
) {
  const tournament = await requireActiveTournament();

  if (!tournament.registrationEnabled) {
    throw new ServiceError("REGISTRATION_CLOSED", PUBLIC_ERROR_MESSAGE);
  }

  await assertRegistrationAllowed(tournament.id, input.email);

  const db = getDb();
  const rows = await db
    .insert(registrations)
    .values({
      tournamentId: tournament.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      skillLevel: input.skillLevel,
      notes: input.notes,
      preferredPlayers: input.preferredPlayers,
      registrationStatus: "pending_review",
      paymentStatus: "submitted",
      paymentProofPath: input.paymentProofPath,
      paymentProofContentType: input.paymentProofContentType,
      paymentSubmittedAt: sql`now()`,
    })
    .returning({ id: registrations.id });

  return rows[0];
}
