import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, registrations, tournaments } from "@/lib/db/schema";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import {
  exportRegistrationsCsv,
  exportRegistrationsCsvForTournament,
} from "@/lib/services/csv-export";
import { requireActiveTournament } from "@/lib/services/tournament";
import { createTournament } from "@/lib/services/tournament-create";

import { insertRegistrationRow, reserveUniqueTestYear, uniqueTestEmail } from "./helpers";

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

describe.skipIf(!hasIntegrationDatabase())("admin CSV export scoping", () => {
  it("exports only registrations for the selected tournament context", async () => {
    const active = await requireActiveTournament();
    const year = await reserveUniqueTestYear();
    const other = await createTournament({
      name: "CSV Scope Test",
      slug: `${year}-csv-scope-${randomUUID()}`,
      year,
      eventDate: `${year}-06-01`,
      teeTime: "09:00",
      locationName: "Test Course",
      entryFeeCents: 8500,
      confirmedCapacityLimit: 68,
      venmoHandle: "@csvscope",
      lifecycleStatus: "draft",
    });
    createdTournamentIds.push(other.id);

    const activeEmail = uniqueTestEmail("csv-active");
    const otherEmail = uniqueTestEmail("csv-other");

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

    const contextCsv = await exportRegistrationsCsv();
    const explicitCsv = await exportRegistrationsCsvForTournament(other.id);

    for (const csv of [contextCsv, explicitCsv]) {
      expect(csv).toContain(otherEmail);
      expect(csv).not.toContain(activeEmail);
    }
  });
});
