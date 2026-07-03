"use client";

import { useEffect, useState } from "react";

import { fetchPaymentProofBlob } from "@/lib/admin/fetch-payment-proof-blob";

import type { ProofLoadState } from "@/lib/admin/payment-proof-state";

export type { ProofLoadState } from "@/lib/admin/payment-proof-state";

function applyProofResult(
  result: Exclude<ProofLoadState, { status: "loading" }>,
  cancelled: boolean,
  setLoadState: (state: ProofLoadState) => void,
): string | undefined {
  if (cancelled) {
    if (result.status === "ready") {
      URL.revokeObjectURL(result.objectUrl);
    }

    return undefined;
  }

  setLoadState(result);

  return result.status === "ready" ? result.objectUrl : undefined;
}

export function usePaymentProofPreview(proofUrl: string): ProofLoadState {
  const [loadState, setLoadState] = useState<ProofLoadState>({ status: "loading" });

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    void fetchPaymentProofBlob(proofUrl).then((result) => {
      objectUrl = applyProofResult(result, cancelled, setLoadState);
    });

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [proofUrl]);

  return loadState;
}
