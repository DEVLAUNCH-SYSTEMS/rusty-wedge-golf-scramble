import { describe, expect, it, vi } from "vitest";

import { runRegistrationSubmit } from "@/lib/actions/registration-submit-flow";

import type { ActiveTournament } from "@/lib/services/tournament";

vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: vi.fn(() => true),
}));

vi.mock("@/lib/services/payment-proof-blob", () => ({
  PaymentProofUploadError: class PaymentProofUploadError extends Error {},
  uploadPaymentProof: vi.fn(async () => ({
    pathname: "payment-proofs/11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222.png",
    contentType: "image/png",
  })),
}));

vi.mock("@/lib/services/registration-create", () => ({
  createPendingRegistration: vi.fn(async () => {
    throw new Error("db down");
  }),
}));

describe("registration submit logging", () => {
  it("H21: DB failure logs omit registration email and phone", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const formData = new FormData();
    formData.set("firstName", "Secret");
    formData.set("lastName", "Player");
    formData.set("email", "secret@example.com");
    formData.set("phone", "5095550100");
    formData.set("skillLevel", "B");
    formData.set("paymentProof", new File(["x"], "proof.png", { type: "image/png" }));

    await expect(
      runRegistrationSubmit(
        formData,
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Test",
          registrationEnabled: true,
        } as ActiveTournament,
        "203.0.113.1",
      ),
    ).rejects.toThrow("db down");

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain("secret@example.com");
    expect(logged).not.toContain("5095550100");

    errorSpy.mockRestore();
  });
});
