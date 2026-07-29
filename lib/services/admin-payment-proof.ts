import {
  assertStoredPaymentProofPathname,
  uploadPaymentProof,
} from "@/lib/services/payment-proof-blob";
import { ServiceError } from "@/lib/services/service-error";

import type { AdminManualPaymentStatus } from "@/lib/services/admin-manual-payment";

export type AdminPaymentProofFields = {
  paymentProofPath: string | null;
  paymentProofContentType: string | null;
};

export type ResolveAdminPaymentProofInput = {
  paymentStatus: AdminManualPaymentStatus;
  tournamentId: string;
  file?: File | null;
  paymentProofPath?: string | null;
  paymentProofContentType?: string | null;
};

function emptyProofFields(): AdminPaymentProofFields {
  return {
    paymentProofPath: null,
    paymentProofContentType: null,
  };
}

function proofFieldsFromStoredPaths(
  path: string,
  contentType: string | null | undefined,
): AdminPaymentProofFields {
  assertStoredPaymentProofPathname(path);

  if (!contentType) {
    throw new ServiceError(
      "INVALID_PAYMENT_PROOF",
      "Payment proof content type is required when a path is provided.",
    );
  }

  return {
    paymentProofPath: path,
    paymentProofContentType: contentType,
  };
}

/** Optional proof for submitted/verified admin creates. */
export async function resolveAdminPaymentProof(
  input: ResolveAdminPaymentProofInput,
): Promise<AdminPaymentProofFields> {
  if (input.file) {
    const upload = await uploadPaymentProof(input.file, input.tournamentId);
    return {
      paymentProofPath: upload.pathname,
      paymentProofContentType: upload.contentType,
    };
  }

  if (input.paymentProofPath) {
    return proofFieldsFromStoredPaths(
      input.paymentProofPath,
      input.paymentProofContentType,
    );
  }

  if (input.paymentProofContentType) {
    throw new ServiceError(
      "INVALID_PAYMENT_PROOF",
      "Payment proof path is required when a content type is provided.",
    );
  }

  return emptyProofFields();
}
