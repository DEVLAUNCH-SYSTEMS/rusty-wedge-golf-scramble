import { describe, expect, it } from "vitest";

import {
  assertStoredPaymentProofPathname,
  PaymentProofUploadError,
  validatePaymentProofFile,
} from "@/lib/services/payment-proof-blob";

function createFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], "proof.png", { type });
}

describe("payment proof blob validation", () => {
  it("accepts allowed file types under the size limit", () => {
    expect(() => validatePaymentProofFile(createFile("image/png", 1024))).not.toThrow();
    expect(() => validatePaymentProofFile(createFile("image/jpeg", 1024))).not.toThrow();
    expect(() =>
      validatePaymentProofFile(createFile("application/pdf", 1024)),
    ).not.toThrow();
  });

  it("rejects empty, oversized, and unsupported files", () => {
    expect(() => validatePaymentProofFile(createFile("image/png", 0))).toThrow(
      PaymentProofUploadError,
    );
    expect(() =>
      validatePaymentProofFile(createFile("image/png", 5 * 1024 * 1024 + 1)),
    ).toThrow(PaymentProofUploadError);
    expect(() => validatePaymentProofFile(createFile("text/plain", 1024))).toThrow(
      PaymentProofUploadError,
    );
  });

  it("accepts only tournament-scoped stored pathnames", () => {
    const tournamentId = "11111111-1111-1111-1111-111111111111";
    const blobId = "22222222-2222-2222-2222-222222222222";

    expect(() =>
      assertStoredPaymentProofPathname(`payment-proofs/${tournamentId}/${blobId}.png`),
    ).not.toThrow();

    expect(() => assertStoredPaymentProofPathname("../etc/passwd")).toThrow(
      PaymentProofUploadError,
    );
    expect(() =>
      assertStoredPaymentProofPathname("payment-proofs/other-store/leak.png"),
    ).toThrow(PaymentProofUploadError);
  });
});
