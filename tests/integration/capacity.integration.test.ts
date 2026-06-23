import { describe, expect, it } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { getConfirmedCount } from "@/lib/services/capacity-query";

import {
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

describe.skipIf(!hasIntegrationDatabase())("capacity integration", () => {
  it("H1: pending_review registrations do not count toward confirmed capacity", async () => {
    const tournamentId = await getActiveTournamentId();
    const before = await getConfirmedCount(tournamentId);

    await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("pending"),
      registrationStatus: "pending_review",
    });

    expect(await getConfirmedCount(tournamentId)).toBe(before);
  });

  it("H2: confirmed registrations count toward capacity", async () => {
    const tournamentId = await getActiveTournamentId();
    const before = await getConfirmedCount(tournamentId);

    await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("confirmed"),
      registrationStatus: "confirmed",
    });

    expect(await getConfirmedCount(tournamentId)).toBe(before + 1);
  });
});
