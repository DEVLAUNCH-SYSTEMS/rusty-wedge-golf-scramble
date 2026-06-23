import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuthError } from "@/lib/services/admin-auth";
import {
  getPaymentProofForAdmin,
  PaymentProofViewerError,
} from "@/lib/services/payment-proof-viewer";
import { ServiceError } from "@/lib/services/service-error";

const requireAdminSession = vi.fn();
const requireActiveTournament = vi.fn();
const findRegistrationById = vi.fn();
const blobGet = vi.fn();

vi.mock("@/lib/services/admin-auth", () => ({
  AdminAuthError: class AdminAuthError extends Error {
    readonly code: "UNAUTHENTICATED" | "FORBIDDEN";

    constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
      super(message);
      this.name = "AdminAuthError";
      this.code = code;
    }
  },
  requireAdminSession: (...args: unknown[]) => requireAdminSession(...args),
}));

vi.mock("@/lib/services/tournament", () => ({
  requireActiveTournament: (...args: unknown[]) => requireActiveTournament(...args),
  assertTournamentScope: (recordTournamentId: string, activeTournamentId: string) => {
    if (recordTournamentId !== activeTournamentId) {
      throw new ServiceError(
        "TOURNAMENT_SCOPE_MISMATCH",
        "Record is outside the active tournament.",
      );
    }
  },
}));

vi.mock("@/lib/services/registration-queries", () => ({
  findRegistrationById: (...args: unknown[]) => findRegistrationById(...args),
}));

vi.mock("@vercel/blob", () => ({
  get: (...args: unknown[]) => blobGet(...args),
}));

const activeTournament = {
  id: "11111111-1111-1111-1111-111111111111",
};

const registrationId = "33333333-3333-3333-3333-333333333333";
const proofPath = `payment-proofs/${activeTournament.id}/22222222-2222-2222-2222-222222222222.png`;

describe("getPaymentProofForAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    requireActiveTournament.mockResolvedValue(activeTournament);
    findRegistrationById.mockResolvedValue({
      id: registrationId,
      tournamentId: activeTournament.id,
      paymentProofPath: proofPath,
      paymentProofContentType: "image/png",
    });
    blobGet.mockResolvedValue({
      statusCode: 200,
      stream: new ReadableStream<Uint8Array>(),
      blob: { contentType: "image/png" },
    });
  });

  it("returns the blob stream for an authorized admin", async () => {
    const proof = await getPaymentProofForAdmin(registrationId);

    expect(proof.contentType).toBe("image/png");
    expect(blobGet).toHaveBeenCalledWith(proofPath, {
      access: "private",
      useCache: false,
    });
  });

  it("requires an authenticated admin session", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    await expect(getPaymentProofForAdmin(registrationId)).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("requires an allowlisted admin", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
    );

    await expect(getPaymentProofForAdmin(registrationId)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("returns not found for missing registrations", async () => {
    findRegistrationById.mockResolvedValue(null);

    await expect(getPaymentProofForAdmin(registrationId)).rejects.toBeInstanceOf(
      PaymentProofViewerError,
    );
  });

  it("returns not found for registrations outside the active tournament", async () => {
    findRegistrationById.mockResolvedValue({
      id: registrationId,
      tournamentId: "99999999-9999-9999-9999-999999999999",
      paymentProofPath: proofPath,
      paymentProofContentType: "image/png",
    });

    await expect(getPaymentProofForAdmin(registrationId)).rejects.toMatchObject({
      code: "REGISTRATION_NOT_FOUND",
    });
  });

  it("returns not found when no proof path is stored", async () => {
    findRegistrationById.mockResolvedValue({
      id: registrationId,
      tournamentId: activeTournament.id,
      paymentProofPath: null,
      paymentProofContentType: null,
    });

    await expect(getPaymentProofForAdmin(registrationId)).rejects.toMatchObject({
      code: "PROOF_NOT_FOUND",
    });
  });

  it("fetches only the pathname stored on the registration row", async () => {
    await getPaymentProofForAdmin(registrationId);

    expect(blobGet).toHaveBeenCalledTimes(1);
    expect(blobGet.mock.calls[0]?.[0]).toBe(proofPath);
  });
});
