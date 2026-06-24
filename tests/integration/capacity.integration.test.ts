import { and, count, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrations } from "@/lib/db/schema";

import {
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

async function countRegistrationInConfirmedCapacity(
  registrationId: string,
): Promise<number> {
  const rows = await getDb()
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.id, registrationId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    );

  return Number(rows[0]?.total ?? 0);
}

describe.skipIf(!hasIntegrationDatabase())("capacity integration", () => {
  it("H1: pending_review registrations do not count toward confirmed capacity", async () => {
    const tournamentId = await getActiveTournamentId();
    const registration = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("pending"),
      registrationStatus: "pending_review",
    });

    expect(
      await countRegistrationInConfirmedCapacity(registration!.id),
    ).toBe(0);
  });

  it("H2: confirmed registrations count toward capacity", async () => {
    const tournamentId = await getActiveTournamentId();
    const registration = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("confirmed"),
      registrationStatus: "confirmed",
    });

    expect(
      await countRegistrationInConfirmedCapacity(registration!.id),
    ).toBe(1);
  });
});
