import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import {
  registrations,
  teams,
  tournaments,
  waitlistEntries,
} from "@/lib/db/schema";
import { createTournamentFromPriorSettings } from "@/lib/services/tournament-copy-settings";
import { createTournament } from "@/lib/services/tournament-create";

import { reserveUniqueTestYearPair } from "./helpers";

const createdTournamentIds: string[] = [];

afterEach(async () => {
  const db = getDb();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db
      .delete(registrations)
      .where(eq(registrations.tournamentId, tournamentId));
    await db
      .delete(waitlistEntries)
      .where(eq(waitlistEntries.tournamentId, tournamentId));
    await db.delete(teams).where(eq(teams.tournamentId, tournamentId));
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }
});

async function countPlayerRecords(tournamentId: string) {
  const db = getDb();

  const [registrationCount, waitlistCount, teamCount] = await Promise.all([
    db
      .select({ id: registrations.id })
      .from(registrations)
      .where(eq(registrations.tournamentId, tournamentId))
      .then((rows) => rows.length),
    db
      .select({ id: waitlistEntries.id })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.tournamentId, tournamentId))
      .then((rows) => rows.length),
    db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.tournamentId, tournamentId))
      .then((rows) => rows.length),
  ]);

  return { registrationCount, waitlistCount, teamCount };
}

describe.skipIf(!hasIntegrationDatabase())(
  "createTournamentFromPriorSettings service",
  () => {
    it("copies config fields and does not copy registrations, teams, or waitlist", async () => {
      const [sourceYear, targetYear] = await reserveUniqueTestYearPair();

      const source = await createTournament({
        name: `Copy Source ${sourceYear}`,
        slug: `${sourceYear}-copy-source-${randomUUID()}`,
        year: sourceYear,
        eventDate: `${sourceYear}-06-15`,
        teeTime: "10:30",
        locationName: "Copy Test Course",
        entryFeeCents: 9900,
        confirmedCapacityLimit: 64,
        venmoHandle: "@copysource",
        lifecycleStatus: "registration_closed",
      });
      createdTournamentIds.push(source.id);

      const db = getDb();
      await db.insert(registrations).values({
        tournamentId: source.id,
        firstName: "Prior",
        lastName: "Player",
        email: `prior-${randomUUID()}@example.com`,
        phone: "5095550100",
        skillLevel: "A",
        preferredPlayers: "Do not copy this preferred-player text",
        registrationStatus: "confirmed",
        paymentStatus: "verified",
      });
      await db.insert(waitlistEntries).values({
        tournamentId: source.id,
        firstName: "Wait",
        lastName: "Listed",
        email: `wait-${randomUUID()}@example.com`,
        phone: "5095550101",
        skillLevel: "B",
        preferredPlayers: "Do not copy waitlist preferred text",
      });
      await db.insert(teams).values({
        tournamentId: source.id,
        name: "Do Not Copy Team",
      });

      const sourceCounts = await countPlayerRecords(source.id);
      expect(sourceCounts.registrationCount).toBe(1);
      expect(sourceCounts.waitlistCount).toBe(1);
      expect(sourceCounts.teamCount).toBe(1);

      const created = await createTournamentFromPriorSettings({
        sourceTournamentId: source.id,
        year: targetYear,
        eventDate: `${targetYear}-06-15`,
      });
      createdTournamentIds.push(created.id);

      expect(created.locationName).toBe(source.locationName);
      expect(created.entryFeeCents).toBe(source.entryFeeCents);
      expect(created.confirmedCapacityLimit).toBe(
        source.confirmedCapacityLimit,
      );
      expect(created.venmoHandle).toBe(source.venmoHandle);
      expect(created.teeTime).toBe("10:30:00");
      expect(created.slug).toBe(
        `${targetYear}-${source.slug.slice(`${sourceYear}-`.length)}`,
      );
      expect(created.lifecycleStatus).toBe("draft");
      expect(created.isActive).toBe(false);

      const copiedCounts = await countPlayerRecords(created.id);
      expect(copiedCounts).toEqual({
        registrationCount: 0,
        waitlistCount: 0,
        teamCount: 0,
      });

      expect(await countPlayerRecords(source.id)).toEqual(sourceCounts);
    });
  },
);
