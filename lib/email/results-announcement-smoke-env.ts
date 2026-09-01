import {
  DATABASE_TARGET_ENV,
  DEVELOPMENT_DATABASE_TARGET,
} from "@/lib/db/integration-database-target";
import { isResultsAnnouncementEligibleEmail } from "@/lib/domain/results-announcement-eligible-email";
import { isResendConfigured } from "@/lib/email/resend-env";
import { ServiceError } from "@/lib/services/service-error";
import { normalizePlayerEmail } from "@/lib/validation/player-profile";

export const RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV = "RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT";
export const RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX_ENV =
  "RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX";

function isDevelopmentDatabaseTarget(): boolean {
  return process.env[DATABASE_TARGET_ENV]?.trim() === DEVELOPMENT_DATABASE_TARGET;
}

function readConfiguredSmokeRecipient(): string | null {
  const raw = process.env[RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV]?.trim();

  if (!raw) {
    return null;
  }

  const normalized = normalizePlayerEmail(raw);

  if (!normalized || !isResultsAnnouncementEligibleEmail(normalized)) {
    return null;
  }

  return normalized;
}

export function isResultsAnnouncementSmokeTestEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (process.env.CI === "true") {
    return false;
  }

  if (!isDevelopmentDatabaseTarget()) {
    return false;
  }

  if (!isResendConfigured()) {
    return false;
  }

  return readConfiguredSmokeRecipient() !== null;
}

export function assertResultsAnnouncementSmokeTestAllowed(): void {
  if (process.env.NODE_ENV === "production") {
    throw new ServiceError("SMOKE_TEST_FORBIDDEN", "Smoke test sends are disabled in production.");
  }

  if (process.env.CI === "true") {
    throw new ServiceError("SMOKE_TEST_FORBIDDEN", "Smoke test sends are disabled in CI.");
  }

  if (!isDevelopmentDatabaseTarget()) {
    throw new ServiceError(
      "SMOKE_TEST_FORBIDDEN",
      `Smoke test sends require ${DATABASE_TARGET_ENV}=${DEVELOPMENT_DATABASE_TARGET}.`,
    );
  }

  if (!isResendConfigured()) {
    throw new ServiceError("EMAIL_CONFIG", "Email is not configured.");
  }

  readResultsAnnouncementSmokeRecipient();
}

export function readResultsAnnouncementSmokeRecipient(): string {
  const configured = readConfiguredSmokeRecipient();

  if (!configured) {
    throw new ServiceError(
      "SMOKE_TEST_CONFIG",
      `${RESULTS_ANNOUNCEMENT_SMOKE_RECIPIENT_ENV} must be set to a valid non-placeholder email address.`,
    );
  }

  return configured;
}

export function readResultsAnnouncementSmokeIdempotencySuffix(): string {
  const configured = process.env[RESULTS_ANNOUNCEMENT_SMOKE_IDEMPOTENCY_SUFFIX_ENV]?.trim();

  if (configured) {
    return configured;
  }

  return String(Date.now());
}
