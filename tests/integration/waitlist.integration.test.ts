import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrations, waitlistEntries } from "@/lib/db/schema";
import { createWaitlistEntry } from "@/lib/services/waitlist-create";
import { promoteWaitlistEntry } from "@/lib/services/waitlist-promote";

import {
  createTestAdminSession,
  uniqueTestEmail,
} from "./helpers";

describe.skipIf(!hasIntegrationDatabase())("waitlist integration", () => {
  it("H11: promotion carries skill level and preferred-player notes forward", async () => {
    const admin = await createTestAdminSession();
    const email = uniqueTestEmail("waitlist-promote");

    const entry = await createWaitlistEntry({
      firstName: "Wait",
      lastName: "Listed",
      email,
      phone: "5095550199",
      skillLevel: "A",
      preferredPlayers: "Pat and Sam",
      notes: "Morning tee preferred",
    });

    const promoted = await promoteWaitlistEntry(entry!.id, admin);
    const db = getDb();

    const registration = (
      await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, promoted.id))
        .limit(1)
    )[0];

    const waitlistRow = (
      await db
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.id, entry!.id))
        .limit(1)
    )[0];

    expect(registration?.skillLevel).toBe("A");
    expect(registration?.preferredPlayers).toBe("Pat and Sam");
    expect(registration?.notes).toBe("Morning tee preferred");
    expect(registration?.registrationStatus).toBe("pending_review");
    expect(waitlistRow?.status).toBe("promoted");
  });
});
