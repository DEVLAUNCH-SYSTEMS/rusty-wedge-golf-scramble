import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveAdminPaymentProof } from "@/lib/services/admin-payment-proof";
import { PaymentProofUploadError } from "@/lib/services/payment-proof-blob";
import { ServiceError } from "@/lib/services/service-error";

const uploadPaymentProof = vi.fn();

vi.mock("@/lib/services/payment-proof-blob", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/services/payment-proof-blob")
  >("@/lib/services/payment-proof-blob");

  return {
    ...actual,
    uploadPaymentProof: (...args: unknown[]) => uploadPaymentProof(...args),
  };
});

const tournamentId = "11111111-1111-1111-1111-111111111111";
const validPath = `payment-proofs/${tournamentId}/${randomUUID()}.png`;

describe("admin optional payment proof", () => {
  beforeEach(() => {
    uploadPaymentProof.mockReset();
  });

  it("allows submitted/verified without a proof file", async () => {
    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "submitted",
        tournamentId,
      }),
    ).resolves.toEqual({
      paymentProofPath: null,
      paymentProofContentType: null,
    });

    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "verified",
        tournamentId,
      }),
    ).resolves.toEqual({
      paymentProofPath: null,
      paymentProofContentType: null,
    });
  });

  it("uploads optional proof file for submitted payment", async () => {
    const file = new File(["x"], "proof.png", { type: "image/png" });
    uploadPaymentProof.mockResolvedValue({
      pathname: validPath,
      contentType: "image/png",
    });

    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "submitted",
        tournamentId,
        file,
      }),
    ).resolves.toEqual({
      paymentProofPath: validPath,
      paymentProofContentType: "image/png",
    });

    expect(uploadPaymentProof).toHaveBeenCalledWith(file, tournamentId);
  });

  it("accepts a valid stored proof path without uploading", async () => {
    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "verified",
        tournamentId,
        paymentProofPath: validPath,
        paymentProofContentType: "image/png",
      }),
    ).resolves.toEqual({
      paymentProofPath: validPath,
      paymentProofContentType: "image/png",
    });

    expect(uploadPaymentProof).not.toHaveBeenCalled();
  });

  it("rejects invalid stored proof paths", async () => {
    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "submitted",
        tournamentId,
        paymentProofPath: "../../../etc/passwd",
        paymentProofContentType: "image/png",
      }),
    ).rejects.toBeInstanceOf(PaymentProofUploadError);
  });

  it("rejects path without content type and content type without path", async () => {
    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "submitted",
        tournamentId,
        paymentProofPath: validPath,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_PAYMENT_PROOF",
    } satisfies Partial<ServiceError>);

    await expect(
      resolveAdminPaymentProof({
        paymentStatus: "submitted",
        tournamentId,
        paymentProofContentType: "image/png",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_PAYMENT_PROOF",
    } satisfies Partial<ServiceError>);
  });
});
