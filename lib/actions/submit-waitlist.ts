"use server";

import { headers } from "next/headers";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { parseWaitlistFormData } from "@/lib/actions/parse-form-data";
import { checkRateLimit, extractClientIp } from "@/lib/services/rate-limit";
import {
  PUBLIC_ERROR_MESSAGE,
  ServiceError,
} from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";
import { createWaitlistEntry } from "@/lib/services/waitlist-create";

export async function submitWaitlist(formData: FormData): Promise<ActionResult> {
  try {
    const tournament = await requireActiveTournament();
    const requestHeaders = await headers();
    const clientIp = extractClientIp(requestHeaders);

    if (!checkRateLimit("waitlist_submit", tournament.id, clientIp)) {
      return actionFailure("Too many requests. Please try again later.");
    }

    const input = parseWaitlistFormData(formData);
    await createWaitlistEntry(input);

    return actionSuccess(
      "You are on the waitlist. Organizers will contact you if a spot opens.",
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return actionFailure(PUBLIC_ERROR_MESSAGE);
    }

    return actionFailure(PUBLIC_ERROR_MESSAGE);
  }
}
