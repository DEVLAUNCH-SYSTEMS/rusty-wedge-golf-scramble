export type RateLimitAction = "registration_submit" | "waitlist_submit";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

type RateLimitEntry = {
  count: number;
  windowStartedAt: number;
};

const counters = new Map<string, RateLimitEntry>();

function buildRateLimitKey(
  action: RateLimitAction,
  tournamentId: string,
  clientIp: string,
): string {
  return `${action}:${tournamentId}:${clientIp}`;
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(
  action: RateLimitAction,
  tournamentId: string,
  clientIp: string,
): boolean {
  const key = buildRateLimitKey(action, tournamentId, clientIp);
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || now - existing.windowStartedAt >= WINDOW_MS) {
    counters.set(key, { count: 1, windowStartedAt: now });
    return true;
  }

  if (existing.count >= MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  counters.set(key, existing);
  return true;
}

export function resetRateLimitsForTests(): void {
  counters.clear();
}
