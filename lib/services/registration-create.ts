import {
  assertRegistrationEmailAvailable,
  insertRegistrationRecord,
} from "@/lib/services/player-create-shared";
import {
  PUBLIC_ERROR_MESSAGE,
  ServiceError,
} from "@/lib/services/service-error";
import { isPublicRegistrationOpen } from "@/lib/services/tournament";
import { normalizePlayerEmail } from "@/lib/validation/player-profile";

import type { PublicCreateTournament } from "@/lib/services/tournament";
import type { SubmitRegistrationInput } from "@/lib/validation/forms";

export type CreateRegistrationInput = SubmitRegistrationInput & {
  paymentProofPath: string;
  paymentProofContentType: string;
};

export async function createPendingRegistration(
  input: CreateRegistrationInput,
  tournament: PublicCreateTournament,
) {
  if (!isPublicRegistrationOpen(tournament)) {
    throw new ServiceError("REGISTRATION_CLOSED", PUBLIC_ERROR_MESSAGE);
  }

  const email = normalizePlayerEmail(input.email);

  await assertRegistrationEmailAvailable(tournament.id, email);

  return insertRegistrationRecord({
    tournamentId: tournament.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    phone: input.phone,
    skillLevel: input.skillLevel,
    notes: input.notes,
    preferredPlayers: input.preferredPlayers,
    registrationStatus: "pending_review",
    paymentStatus: "submitted",
    paymentProofPath: input.paymentProofPath,
    paymentProofContentType: input.paymentProofContentType,
    markPaymentSubmittedAt: true,
    createdSource: "public",
  });
}
