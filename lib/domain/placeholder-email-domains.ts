/**
 * Domains that must never receive results announcement email.
 *
 * Project conventions already covered:
 * - `example.com` — integration/E2E fixtures (`INTEGRATION_TEST_EMAIL_DOMAIN`)
 *
 * Also includes IANA reserved documentation domains and common test TLDs.
 */
export const PLACEHOLDER_EMAIL_DOMAINS = [
  "example.com",
  "example.org",
  "example.net",
  "test.com",
] as const;

export type PlaceholderEmailDomain = (typeof PLACEHOLDER_EMAIL_DOMAINS)[number];

const PLACEHOLDER_EMAIL_DOMAIN_SET = new Set<string>(
  PLACEHOLDER_EMAIL_DOMAINS.map((domain) => domain.toLowerCase()),
);

export function normalizeEmailDomain(domain: string): string {
  return domain.trim().toLowerCase();
}

export function extractEmailDomain(email: string): string | null {
  const atIndex = email.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === email.length - 1) {
    return null;
  }

  return normalizeEmailDomain(email.slice(atIndex + 1));
}

export function isPlaceholderEmailDomain(domain: string): boolean {
  return PLACEHOLDER_EMAIL_DOMAIN_SET.has(normalizeEmailDomain(domain));
}

export function isPlaceholderEmailAddress(email: string): boolean {
  const domain = extractEmailDomain(email);

  if (!domain) {
    return false;
  }

  return isPlaceholderEmailDomain(domain);
}
