import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { ServiceError } from "@/lib/services/service-error";
import { getActiveTournament } from "@/lib/services/tournament";
import { activateTournament } from "@/lib/services/tournament-activate";
import { createTournament } from "@/lib/services/tournament-create";

import { createTestAdminSession, getActiveTournamentId, reserveUniqueTestYearPair } from "./helpers";

const createdTournamentIds: string[] = [];
let restoredActiveTournamentId: string | null = null;

async function insertInactiveTestTournament(
  year: number,
  overrides: Record<string, unknown> = {},
) {
  return createTournament({
    name: "Activation Test Tournament",
    slug: `${year}-activate-${randomUUID()}`,
    year,
    eventDate: `${year}-06-01`,
    locationName: "Activation Test Course",
    entryFeeCents: 8500,
    confirmedCapacityLimit: 68,
    venmoHandle: "@activatetest",
    lifecycleStatus: "draft",
    ...overrides,
  });
}

function uniqueTestYearPair(): Promise<[number, number]> {
  return reserveUniqueTestYearPair();
}

async function countActiveTournaments() {
  const db = getDb();
  const rows = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.isActive, true));

  return rows.length;
}

afterEach(async () => {
  const db = getDb();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db
      .delete(registrationEvents)
      .where(eq(registrationEvents.tournamentId, tournamentId));
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }

  if (restoredActiveTournamentId) {
    await db
      .update(tournaments)
      .set({ isActive: false })
      .where(eq(tournaments.isActive, true));
    await db
      .update(tournaments)
      .set({ isActive: true })
      .where(eq(tournaments.id, restoredActiveTournamentId));
    restoredActiveTournamentId = null;
  }
});

describe.skipIf(!hasIntegrationDatabase())("activateTournament service", () => {
  it("sets one tournament active and deactivates the prior active row", async () => {
    const admin = await createTestAdminSession();
    const previousActiveId = await getActiveTournamentId();
    restoredActiveTournamentId = previousActiveId;

    const [nextYear] = await uniqueTestYearPair();
    const next = await insertInactiveTestTournament(nextYear);
    createdTournamentIds.push(next.id);

    const activated = await activateTournament({
      tournamentId: next.id,
      adminUserId: admin.adminUserId,
    });

    expect(activated.isActive).toBe(true);
    expect(await countActiveTournaments()).toBe(1);

    const previousActive = (
      await getDb()
        .select({ isActive: tournaments.isActive })
        .from(tournaments)
        .where(eq(tournaments.id, previousActiveId))
        .limit(1)
    )[0];
    expect(previousActive?.isActive).toBe(false);

    const events = await getDb()
      .select({
        eventType: registrationEvents.eventType,
        metadata: registrationEvents.metadata,
      })
      .from(registrationEvents)
      .where(eq(registrationEvents.tournamentId, next.id));

    expect(
      events.some(
        (event) => event.eventType === AUDIT_EVENT_TYPES.tournamentActivated,
      ),
    ).toBe(true);
    expect(
      events.find(
        (event) => event.eventType === AUDIT_EVENT_TYPES.tournamentActivated,
      )?.metadata,
    ).toEqual({
      previousActiveTournamentId: previousActiveId,
    });
  });

  it("is idempotent when the tournament is already active", async () => {
    const admin = await createTestAdminSession();
    const activeId = await getActiveTournamentId();
    restoredActiveTournamentId = activeId;

    const beforeCount = (
      await getDb()
        .select({ id: registrationEvents.id })
        .from(registrationEvents)
        .where(eq(registrationEvents.tournamentId, activeId))
    ).length;

    const activated = await activateTournament({
      tournamentId: activeId,
      adminUserId: admin.adminUserId,
    });

    expect(activated.id).toBe(activeId);
    expect(await countActiveTournaments()).toBe(1);

    const afterCount = (
      await getDb()
        .select({ id: registrationEvents.id })
        .from(registrationEvents)
        .where(eq(registrationEvents.tournamentId, activeId))
    ).length;

    expect(afterCount).toBe(beforeCount);
  });

  it("rejects activating an archived tournament", async () => {
    const admin = await createTestAdminSession();
    const [archivedYear] = await uniqueTestYearPair();
    const archived = await insertInactiveTestTournament(archivedYear);
    createdTournamentIds.push(archived.id);

    await getDb()
      .update(tournaments)
      .set({ lifecycleStatus: "archived" })
      .where(eq(tournaments.id, archived.id));

    await expect(
      activateTournament({
        tournamentId: archived.id,
        adminUserId: admin.adminUserId,
      }),
    ).rejects.toMatchObject({
      code: "TOURNAMENT_ARCHIVED",
    } satisfies Partial<ServiceError>);
  });

  it("leaves exactly one active tournament under concurrent activation", async () => {
    const admin = await createTestAdminSession();
    const seedId = await getActiveTournamentId();
    restoredActiveTournamentId = seedId;

    await getDb()
      .update(tournaments)
      .set({ isActive: false })
      .where(eq(tournaments.id, seedId));

    const [firstYear, secondYear] = await uniqueTestYearPair();
    const first = await insertInactiveTestTournament(firstYear);
    const second = await insertInactiveTestTournament(secondYear);
    createdTournamentIds.push(first.id, second.id);

    const [firstResult, secondResult] = await Promise.all([
      activateTournament({
        tournamentId: first.id,
        adminUserId: admin.adminUserId,
      }),
      activateTournament({
        tournamentId: second.id,
        adminUserId: admin.adminUserId,
      }),
    ]);

    expect(firstResult.isActive).toBe(true);
    expect(secondResult.isActive).toBe(true);
    expect(await countActiveTournaments()).toBe(1);

    const active = await getActiveTournament();
    expect([first.id, second.id]).toContain(active?.id);
  });
});
