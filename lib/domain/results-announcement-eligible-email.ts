import { z } from "zod";

import { isPlaceholderEmailAddress } from "@/lib/domain/placeholder-email-domains";
import { normalizePlayerEmail } from "@/lib/validation/player-profile";

const syntacticEmailSchema = z.string().email();

export function hasSyntacticallyValidEmailAddress(email: string): boolean {
  return syntacticEmailSchema.safeParse(email).success;
}

export function isResultsAnnouncementEligibleEmail(email: string): boolean {
  const normalized = normalizePlayerEmail(email);

  if (!normalized) {
    return false;
  }

  if (!hasSyntacticallyValidEmailAddress(normalized)) {
    return false;
  }

  if (isPlaceholderEmailAddress(normalized)) {
    return false;
  }

  return true;
}
