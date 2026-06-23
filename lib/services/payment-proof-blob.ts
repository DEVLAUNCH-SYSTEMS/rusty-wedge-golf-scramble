import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

import { PUBLIC_ERROR_MESSAGE } from "@/lib/services/service-error";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

const STORED_PATHNAME_PATTERN =
  /^payment-proofs\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|pdf)$/i;

export class PaymentProofUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentProofUploadError";
  }
}

function extensionForContentType(contentType: string): string {
  const extension = EXTENSION_BY_TYPE[contentType];

  if (!extension) {
    throw new PaymentProofUploadError("Unsupported payment proof file type.");
  }

  return extension;
}

export function validatePaymentProofFile(file: File): void {
  if (file.size === 0) {
    throw new PaymentProofUploadError("Payment proof file is required.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new PaymentProofUploadError("Payment proof must be 5 MB or smaller.");
  }

  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    throw new PaymentProofUploadError(
      "Payment proof must be JPG, PNG, or PDF.",
    );
  }
}

export function assertStoredPaymentProofPathname(pathname: string): void {
  if (!STORED_PATHNAME_PATTERN.test(pathname)) {
    throw new PaymentProofUploadError("Invalid payment proof storage path.");
  }
}

function hasBlobCredentials(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return true;
  }

  return Boolean(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN);
}

function assertBlobUploadConfigured(): void {
  if (hasBlobCredentials()) {
    return;
  }

  console.error(
    "Payment proof upload failed: missing Blob credentials (BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID + VERCEL_OIDC_TOKEN)",
  );

  const message =
    process.env.NODE_ENV === "development"
      ? "Payment proof storage is not configured locally. Run `npx vercel link` then `npx vercel env pull .env.local` to fetch VERCEL_OIDC_TOKEN (see docs/blob-setup.md)."
      : PUBLIC_ERROR_MESSAGE;

  throw new PaymentProofUploadError(message);
}

export async function uploadPaymentProof(
  file: File,
  tournamentId: string,
): Promise<{ pathname: string; contentType: string }> {
  validatePaymentProofFile(file);
  assertBlobUploadConfigured();

  const extension = extensionForContentType(file.type);
  const pathname = `payment-proofs/${tournamentId}/${randomUUID()}.${extension}`;

  try {
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.type,
    });

    return {
      pathname: blob.pathname,
      contentType: file.type,
    };
  } catch (error) {
    console.error("Payment proof blob upload failed:", error);
    throw new PaymentProofUploadError(PUBLIC_ERROR_MESSAGE);
  }
}
