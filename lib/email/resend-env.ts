import { normalizeAppBaseUrl } from "@/lib/email/app-base-url";
import { ServiceError } from "@/lib/services/service-error";

export type ResendEnvConfig = {
  apiKey: string;
  from: string;
  appBaseUrl: string;
};

export const RESULTS_ANNOUNCEMENT_SENDER_NAME = "Rusty Wedge Golf Scramble";

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ServiceError(
      "EMAIL_CONFIG",
      `${name} must be set before sending email.`,
    );
  }

  return value;
}

function extractResendFromEmailAddress(from: string): string {
  const angleAddress = from.match(/<([^>]+)>/);

  if (angleAddress?.[1]) {
    return angleAddress[1].trim();
  }

  if (from.includes("@")) {
    return from.trim();
  }

  throw new ServiceError(
    "EMAIL_CONFIG",
    "RESEND_FROM must include a valid email address.",
  );
}

export function normalizeResultsAnnouncementFromAddress(from: string): string {
  const emailAddress = extractResendFromEmailAddress(from);

  return `${RESULTS_ANNOUNCEMENT_SENDER_NAME} <${emailAddress}>`;
}

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_FROM?.trim() &&
      process.env.APP_BASE_URL?.trim(),
  );
}

export function getResendEnvConfig(): ResendEnvConfig {
  const apiKey = readRequiredEnv("RESEND_API_KEY");
  const from = normalizeResultsAnnouncementFromAddress(readRequiredEnv("RESEND_FROM"));

  return {
    apiKey,
    from,
    appBaseUrl: normalizeAppBaseUrl(readRequiredEnv("APP_BASE_URL")),
  };
}
