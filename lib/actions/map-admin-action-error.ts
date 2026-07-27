import { ZodError } from "zod";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";
import { AdminAuthError } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";

export function mapAdminActionError(
  error: unknown,
  logLabel: string,
): ActionResult {
  if (error instanceof AdminAuthError) {
    return actionFailure(error.message);
  }

  if (error instanceof ServiceError) {
    return actionFailure(error.message);
  }

  if (error instanceof ZodError) {
    return actionFailure(
      error.issues[0]?.message ?? "Please check the form and try again.",
    );
  }

  console.error(`${logLabel}:`, error);
  return actionFailure("Unable to complete that action. Please try again.");
}
