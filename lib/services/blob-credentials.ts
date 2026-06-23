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

export function hasBlobCredentials(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return true;
  }

  if (!process.env.BLOB_STORE_ID || !process.env.VERCEL_OIDC_TOKEN) {
    return false;
  }

  return !isOidcTokenExpired();
}

export function getBlobCredentialDevMessage(): string {
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

export function assertBlobCredentialsConfigured(): void {
  if (hasBlobCredentials()) {
    return;
  }

  const devMessage = getBlobCredentialDevMessage();

  console.error("Blob credentials unavailable:", devMessage || "missing credentials");

  throw new Error(
    process.env.NODE_ENV === "development" && devMessage
      ? devMessage
      : PUBLIC_ERROR_MESSAGE,
  );
}
