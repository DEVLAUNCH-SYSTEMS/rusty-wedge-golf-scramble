import {
  parseRegistrationFormData,
  readPaymentProofFile,
} from "@/lib/actions/parse-form-data";
import {
  PaymentProofUploadError,
  uploadPaymentProof,
} from "@/lib/services/payment-proof-blob";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { createPendingRegistration } from "@/lib/services/registration-create";

import type { CreateRegistrationInput } from "@/lib/services/registration-create";
import type { ActiveTournament } from "@/lib/services/tournament";

async function createPendingAfterUpload(
  input: CreateRegistrationInput,
  tournament: ActiveTournament,
): Promise<void> {
  try {
    await createPendingRegistration(input, tournament);
  } catch (error) {
    console.error("Registration DB insert failed after blob upload:", {
      tournamentId: tournament.id,
      blobPathname: input.paymentProofPath,
    });
    throw error;
  }
}

export async function runRegistrationSubmit(
  formData: FormData,
  tournament: ActiveTournament,
  clientIp: string,
): Promise<void> {
  if (!checkRateLimit("registration_submit", tournament.id, clientIp)) {
    throw new Error("RATE_LIMIT");
  }

  const input = parseRegistrationFormData(formData);
  const paymentProof = readPaymentProofFile(formData);
  const upload = await uploadPaymentProof(paymentProof, tournament.id);

  await createPendingAfterUpload(
    {
      ...input,
      paymentProofPath: upload.pathname,
      paymentProofContentType: upload.contentType,
    },
    tournament,
  );
}

export function isRegistrationFlowError(error: unknown): boolean {
  return error instanceof PaymentProofUploadError;
}
