import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, registrations, tournaments } from "@/lib/db/schema";
import { listRegistrationsForAdmin } from "@/lib/services/admin-registration-list";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { requireActiveTournament } from "@/lib/services/tournament";
import { createTournament } from "@/lib/services/tournament-create";

import { createTestAdminSession, insertRegistrationRow, reserveUniqueTestYear, uniqueTestEmail } from "./helpers";

const createdTournamentIds: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();

  const db = getDb();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db.delete(registrations).where(eq(registrations.tournamentId, tournamentId));
    await db
      .delete(registrationEvents)
      .where(eq(registrationEvents.tournamentId, tournamentId));
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }
});

describe.skipIf(!hasIntegrationDatabase())(
  "admin tournament context list scoping",
  () => {
    it("scopes registration lists to the selected tournament context", async () => {
      await createTestAdminSession();
      const active = await requireActiveTournament();
      const year = await reserveUniqueTestYear();
      const other = await createTournament({
        name: "Context Scope Test",
        slug: `${year}-context-scope-${randomUUID()}`,
        year,
        eventDate: `${year}-06-01`,
        teeTime: "09:00",
        locationName: "Test Course",
        entryFeeCents: 8500,
        confirmedCapacityLimit: 68,
        venmoHandle: "@contexttest",
        lifecycleStatus: "draft",
      });
      createdTournamentIds.push(other.id);

      const activeEmail = uniqueTestEmail("context-active");
      const otherEmail = uniqueTestEmail("context-other");

      await insertRegistrationRow({
        tournamentId: active.id,
        email: activeEmail,
        registrationStatus: "pending_review",
      });
      await insertRegistrationRow({
        tournamentId: other.id,
        email: otherEmail,
        registrationStatus: "pending_review",
      });

      vi.spyOn(
        adminTournamentContextCookie,
        "readAdminTournamentContextCookie",
      ).mockResolvedValue(other.id);

      const scopedRows = await listRegistrationsForAdmin({
        q: undefined,
        registrationStatus: "all",
        paymentStatus: "all",
        skillLevel: "all",
        assignment: "all",
      });

      expect(scopedRows.some((row) => row.email === otherEmail)).toBe(true);
      expect(scopedRows.some((row) => row.email === activeEmail)).toBe(false);
    });
  },
);
