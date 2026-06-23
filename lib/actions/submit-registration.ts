"use server";

import { headers } from "next/headers";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import {
  isRegistrationFlowError,
  runRegistrationSubmit,
} from "@/lib/actions/registration-submit-flow";
import { PaymentProofUploadError } from "@/lib/services/payment-proof-blob";
import { extractClientIp } from "@/lib/services/rate-limit";
import {
  PUBLIC_ERROR_MESSAGE,
  ServiceError,
} from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";

function mapActionError(error: unknown): ActionResult {
  if (error instanceof ServiceError || error instanceof PaymentProofUploadError) {
    return actionFailure(
      error.message === PUBLIC_ERROR_MESSAGE
        ? PUBLIC_ERROR_MESSAGE
        : error.message,
    );
  }

  return actionFailure(PUBLIC_ERROR_MESSAGE);
}

export async function submitRegistration(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const tournament = await requireActiveTournament();
    const clientIp = extractClientIp(await headers());

    await runRegistrationSubmit(formData, tournament, clientIp);

    return actionSuccess(
      "Registration received. Organizers will review your payment and confirm your spot.",
    );
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT") {
      return actionFailure("Too many requests. Please try again later.");
    }

    if (isRegistrationFlowError(error)) {
      return mapActionError(error);
    }

    return mapActionError(error);
  }
}
