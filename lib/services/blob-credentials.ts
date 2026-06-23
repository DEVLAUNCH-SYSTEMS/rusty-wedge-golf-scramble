import { PUBLIC_ERROR_MESSAGE } from "@/lib/services/service-error";

function readOidcExpiryEpoch(): number | null {
  const token = process.env.VERCEL_OIDC_TOKEN;

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString(),
    ) as { exp?: number };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isOidcTokenExpired(): boolean {
  const expiryEpoch = readOidcExpiryEpoch();

  if (!expiryEpoch) {
    return false;
  }

  return expiryEpoch <= Math.floor(Date.now() / 1000);
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export function hasBlobCredentials(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return true;
  }

  if (!process.env.BLOB_STORE_ID) {
    return false;
  }

  // Vercel injects a fresh OIDC token at runtime — do not require a static env var.
  if (isVercelRuntime()) {
    return true;
  }

  if (!process.env.VERCEL_OIDC_TOKEN) {
    return false;
  }

  return !isOidcTokenExpired();
}

export function getBlobCredentialDevMessage(): string {
  if (process.env.NODE_ENV !== "development") {
    return "";
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return "";
  }

  if (!process.env.BLOB_STORE_ID || !process.env.VERCEL_OIDC_TOKEN) {
    return "Blob storage is not configured locally. Run `npx vercel env pull .env.vercel.local` and merge VERCEL_OIDC_TOKEN into .env.local (see docs/blob-setup.md).";
  }

  if (isOidcTokenExpired()) {
    return "Your local VERCEL_OIDC_TOKEN has expired. Run `npx vercel env pull .env.vercel.local` and merge the new token into .env.local, then restart the dev server.";
  }

  return "";
}

export function getBlobCredentialProductionMessage(): string {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    return "Unable to load payment proof from storage. Confirm the Vercel Blob store is linked to this project (Production environment) and redeploy. Do not set VERCEL_OIDC_TOKEN manually in Vercel — remove it if present so the platform can inject a fresh token.";
  }

  return "Payment proof storage is not configured. Link a Vercel Blob store to this project in Storage settings and redeploy.";
}

export function assertBlobCredentialsConfigured(): void {
  if (hasBlobCredentials()) {
    return;
  }

  const devMessage = getBlobCredentialDevMessage();

  console.error("Blob credentials unavailable:", devMessage || "missing credentials");

  if (process.env.NODE_ENV === "development" && devMessage) {
    throw new Error(devMessage);
  }

  if (isVercelRuntime()) {
    throw new Error(getBlobCredentialProductionMessage());
  }

  throw new Error(PUBLIC_ERROR_MESSAGE);
}
