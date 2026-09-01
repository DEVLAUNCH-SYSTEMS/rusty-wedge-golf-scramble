import { ServiceError } from "@/lib/services/service-error";

export function normalizeAppBaseUrl(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.trim().replace(/^['"]|['"]$/g, "");

  if (!trimmed) {
    throw new ServiceError(
      "EMAIL_CONFIG",
      "APP_BASE_URL must be a valid absolute URL.",
    );
  }

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    return parsed.origin;
  } catch {
    throw new ServiceError(
      "EMAIL_CONFIG",
      "APP_BASE_URL must be a valid absolute URL.",
    );
  }
}

export function buildPublicResultsAbsoluteUrl(appBaseUrl: string): string {
  return `${normalizeAppBaseUrl(appBaseUrl)}/teams`;
}
