import {
  PAYMENT_PROOF_LOAD_ERROR,
  readPaymentProofError,
} from "@/lib/admin/payment-proof-messages";

import type { ProofLoadState } from "@/lib/admin/payment-proof-state";

export async function fetchPaymentProofBlob(
  proofUrl: string,
): Promise<Extract<ProofLoadState, { status: "ready" }> | Extract<ProofLoadState, { status: "error" }>> {
  try {
    const response = await fetch(proofUrl);

    if (!response.ok) {
      return {
        status: "error",
        message: await readPaymentProofError(response),
      };
    }

    const blob = await response.blob();

    return {
      status: "ready",
      objectUrl: URL.createObjectURL(blob),
    };
  } catch {
    return {
      status: "error",
      message: PAYMENT_PROOF_LOAD_ERROR,
    };
  }
}
