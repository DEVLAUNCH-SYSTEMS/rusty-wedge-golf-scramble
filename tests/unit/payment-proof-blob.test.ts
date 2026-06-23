import { describe, expect, it } from "vitest";

import {
  assertStoredPaymentProofPathname,
  PaymentProofUploadError,
  validatePaymentProofFile,
} from "@/lib/services/payment-proof-blob";

describe("payment proof validation", () => {
  it("H6: rejects invalid upload file types", () => {
    const file = new File(["data"], "proof.txt", { type: "text/plain" });

    expect(() => validatePaymentProofFile(file)).toThrow(PaymentProofUploadError);
  });

  it("H7: rejects oversized uploads", () => {
    const bytes = new Uint8Array(5 * 1024 * 1024 + 1);
    const file = new File([bytes], "proof.png", { type: "image/png" });

    expect(() => validatePaymentProofFile(file)).toThrow(PaymentProofUploadError);
  });

  it("H19: rejects arbitrary blob paths stored on registrations", () => {
    expect(() => assertStoredPaymentProofPathname("../../../etc/passwd")).toThrow(
      PaymentProofUploadError,
    );
    expect(() =>
      assertStoredPaymentProofPathname("payment-proofs/not-a-uuid/file.png"),
    ).toThrow(PaymentProofUploadError);
  });
});
