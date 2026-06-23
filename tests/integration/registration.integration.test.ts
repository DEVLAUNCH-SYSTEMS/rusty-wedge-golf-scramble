import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { createPendingRegistration } from "@/lib/services/registration-create";
import { ServiceError } from "@/lib/services/service-error";

import {
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

describe.skipIf(!hasIntegrationDatabase())("registration integration", () => {
  it("H4: blocks duplicate active registration email", async () => {
    const tournamentId = await getActiveTournamentId();
    const email = uniqueTestEmail("duplicate");

    await insertRegistrationRow({
      tournamentId,
      email,
      registrationStatus: "pending_review",
    });

    await expect(
      createPendingRegistration({
        firstName: "Pat",
        lastName: "Player",
        email,
        phone: "5095550101",
        skillLevel: "C",
        paymentProofPath: `payment-proofs/${tournamentId}/${randomUUID()}.png`,
        paymentProofContentType: "image/png",
      }),
    ).rejects.toBeInstanceOf(ServiceError);
  });
});
