const BUILD_PLACEHOLDER_BASE_URL = "https://build-placeholder.neonauth.invalid";
const BUILD_PLACEHOLDER_SECRET =
  "build-placeholder-neon-auth-secret-32chars";

type NeonAuthEnvConfig = {
  baseUrl: string;
  cookies: {
    secret: string;
  };
};

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function normalizeNeonAuthBaseUrl(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.trim().replace(/^['"]|['"]$/g, "");

  if (!trimmed) {
    throw new Error("NEON_AUTH_BASE_URL must be a valid absolute URL.");
  }

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    return parsed.origin + parsed.pathname.replace(/\/+$/, "");
  } catch {
    throw new Error(
      "NEON_AUTH_BASE_URL must be a valid absolute URL (include https:// if missing).",
    );
  }
}

export function isNeonAuthConfigured(): boolean {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;

  return Boolean(baseUrl && secret && secret.length >= 32);
}

export function getNeonAuthConfig(): NeonAuthEnvConfig {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (baseUrl && secret && secret.length >= 32) {
    return {
      baseUrl: normalizeNeonAuthBaseUrl(baseUrl),
      cookies: { secret },
    };
  }

  if (isBuildPhase()) {
    return {
      baseUrl: BUILD_PLACEHOLDER_BASE_URL,
      cookies: { secret: BUILD_PLACEHOLDER_SECRET },
    };
  }

  throw new Error(
    "NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (32+ chars) must be set.",
  );
}
