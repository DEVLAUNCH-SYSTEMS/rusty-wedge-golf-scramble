function normalizeNeonAuthBaseUrl(rawBaseUrl) {
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

try {
  normalizeNeonAuthBaseUrl(process.env.NEON_AUTH_BASE_URL ?? "");
} catch (error) {
  const message =
    error instanceof Error ? error.message : "NEON_AUTH_BASE_URL is invalid.";

  console.error(`::error::${message}`);
  process.exit(1);
}
