/**
 * Local dev can keep DATABASE_URL on a dev branch while CI_GATE_* points at the
 * isolated CI branch. GitHub Actions sets DATABASE_URL directly from repo secrets.
 */
export function applyCiGateDatabaseEnv(force = false): void {
  const ciUrl = process.env.CI_GATE_DATABASE_URL;
  const ciUnpooled = process.env.CI_GATE_DATABASE_URL_UNPOOLED;

  if (ciUrl && (force || !process.env.DATABASE_URL)) {
    process.env.DATABASE_URL = ciUrl;
  }

  if (ciUnpooled && (force || !process.env.DATABASE_URL_UNPOOLED)) {
    process.env.DATABASE_URL_UNPOOLED = ciUnpooled;
  }
}

export function shouldForceCiGateDatabaseEnv(): boolean {
  return process.env.RUN_CI_GATE === "1" || process.env.CI === "true";
}

export function hasIntegrationDatabase(): boolean {
  return Boolean(
    process.env.DATABASE_URL ??
      process.env.CI_GATE_DATABASE_URL ??
      process.env.CI_GATE_DATABASE_URL_UNPOOLED,
  );
}
