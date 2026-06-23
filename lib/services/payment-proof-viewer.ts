import { get } from "@vercel/blob";

import {
  AdminAuthError,
  requireAdminSession,
} from "@/lib/services/admin-auth";
import {
  assertBlobCredentialsConfigured,
  getBlobCredentialDevMessage,
} from "@/lib/services/blob-credentials";
import {
  assertStoredPaymentProofPathname,
  PaymentProofUploadError,
} from "@/lib/services/payment-proof-blob";
import { findRegistrationById } from "@/lib/services/registration-queries";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  requireActiveTournament,
} from "@/lib/services/tournament";

export class PaymentProofViewerError extends Error {
  readonly statusCode: 404 | 503;
  readonly code: string;

  constructor(code: string, message: string, statusCode: 404 | 503 = 404) {
    super(message);
    this.name = "PaymentProofViewerError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export type AdminPaymentProof = {
  body: ArrayBuffer;
  contentType: string;
};

function resolveContentType(
  storedContentType: string | null,
  blobContentType: string | null,
): string {
  return storedContentType ?? blobContentType ?? "application/octet-stream";
}

function mapScopeError(error: unknown): never {
  if (error instanceof ServiceError && error.code === "TOURNAMENT_SCOPE_MISMATCH") {
    throw new PaymentProofViewerError(
      "REGISTRATION_NOT_FOUND",
      "Registration not found.",
    );
  }

  if (error instanceof ServiceError && error.code === "NO_ACTIVE_TOURNAMENT") {
    throw new PaymentProofViewerError(
      "REGISTRATION_NOT_FOUND",
      "Registration not found.",
    );
  }

  throw error;
}

function blobAccessFailureMessage(error: unknown): string {
  const devMessage = getBlobCredentialDevMessage();

  if (devMessage) {
    return devMessage;
  }

  if (error instanceof Error) {
    console.error("Payment proof blob read failed:", error.message);
  }

  return "Unable to load payment proof from storage.";
}

async function fetchPrivateBlob(pathname: string): Promise<AdminPaymentProof> {
  try {
    assertBlobCredentialsConfigured();
  } catch (error) {
    throw new PaymentProofViewerError(
      "BLOB_ACCESS_FAILED",
      blobAccessFailureMessage(error),
      503,
    );
  }

  try {
    const result = await get(pathname, { access: "private", useCache: false });

    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new PaymentProofViewerError("PROOF_NOT_FOUND", "Payment proof not found.");
    }

    const body = await new Response(result.stream).arrayBuffer();

    return {
      body,
      contentType: result.blob.contentType ?? "application/octet-stream",
    };
  } catch (error) {
    if (error instanceof PaymentProofViewerError) {
      throw error;
    }

    throw new PaymentProofViewerError(
      "BLOB_ACCESS_FAILED",
      blobAccessFailureMessage(error),
      503,
    );
  }
}

export async function getPaymentProofForAdmin(
  registrationId: string,
): Promise<AdminPaymentProof> {
  await requireAdminSession();

  let activeTournament;

  try {
    activeTournament = await requireActiveTournament();
  } catch (error) {
    mapScopeError(error);
  }

  const registration = await findRegistrationById(registrationId);

  if (!registration) {
    throw new PaymentProofViewerError("REGISTRATION_NOT_FOUND", "Registration not found.");
  }

  try {
    assertTournamentScope(registration.tournamentId, activeTournament.id);
  } catch (error) {
    mapScopeError(error);
  }

  if (!registration.paymentProofPath) {
    throw new PaymentProofViewerError("PROOF_NOT_FOUND", "Payment proof not found.");
  }

  try {
    assertStoredPaymentProofPathname(registration.paymentProofPath);
  } catch (error) {
    if (error instanceof PaymentProofUploadError) {
      console.error("Invalid payment proof path stored for registration:", {
        registrationId: registration.id,
        tournamentId: registration.tournamentId,
      });
      throw new PaymentProofViewerError("PROOF_NOT_FOUND", "Payment proof not found.");
    }

    throw error;
  }

  const blob = await fetchPrivateBlob(registration.paymentProofPath);

  return {
    body: blob.body,
    contentType: resolveContentType(
      registration.paymentProofContentType,
      blob.contentType,
    ),
  };
}

export function mapPaymentProofViewerAuthError(error: AdminAuthError): Response {
  const status = error.code === "UNAUTHENTICATED" ? 401 : 403;

  return Response.json({ error: error.message }, { status });
}

export function mapPaymentProofViewerError(error: PaymentProofViewerError): Response {
  return Response.json({ error: error.message }, { status: error.statusCode });
}
