import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { createTournament } from "@/lib/services/tournament-create";
import { registrationEnabledFromLifecycle } from "@/lib/services/tournament-lifecycle";

import { createTestAdminSession } from "./helpers";
import { withExclusiveRegistrationOpen } from "./registration-open-test-helpers";

const createdTournamentIds: string[] = [];

afterEach(async () => {
  const db = getDb();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db
      .delete(registrationEvents)
      .where(eq(registrationEvents.tournamentId, tournamentId));
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }
});

function uniqueCreateInput(overrides: Record<string, unknown> = {}) {
  const year = 2080 + Math.floor(Math.random() * 10);
  return {
    name: "Create Tournament Integration Test",
    slug: `${year}-create-test-${randomUUID()}`,
    year,
    eventDate: `${year}-06-01`,
    teeTime: "09:00",
    locationName: "Test Course",
    entryFeeCents: 8500,
    confirmedCapacityLimit: 68,
    venmoHandle: "@createtest",
    lifecycleStatus: "draft" as const,
    ...overrides,
  };
}

describe.skipIf(!hasIntegrationDatabase())("createTournament service", () => {
  it("creates a draft tournament without player data", async () => {
    const input = uniqueCreateInput();

    const created = await createTournament(input);
    createdTournamentIds.push(created.id);

    expect(created.slug).toBe(input.slug);
    expect(created.year).toBe(input.year);
    expect(created.lifecycleStatus).toBe("draft");
    expect(created.isActive).toBe(false);
    expect(created.registrationEnabled).toBe(
      registrationEnabledFromLifecycle("draft"),
    );
    expect(created.teeTime).toBe("09:00:00");
  });

  it("syncs registration_enabled from lifecycle on create", async () => {
    const admin = await createTestAdminSession();

    await withExclusiveRegistrationOpen(admin.adminUserId, async () => {
      const input = uniqueCreateInput({ lifecycleStatus: "registration_open" });

      const created = await createTournament(input);
      createdTournamentIds.push(created.id);

      expect(created.lifecycleStatus).toBe("registration_open");
      expect(created.registrationEnabled).toBe(true);
      expect(created.isActive).toBe(false);
    });
  });

  it("rejects duplicate slug", async () => {
    await expect(
      createTournament({
        ...uniqueCreateInput(),
        slug: "2026-rusty-wedge",
        year: 2026,
      }),
    ).rejects.toMatchObject({
      code: "DUPLICATE_TOURNAMENT_SLUG",
    });
  });

  it("rejects duplicate year", async () => {
    await expect(
      createTournament({
        ...uniqueCreateInput(),
        slug: `2026-duplicate-year-${randomUUID()}`,
        year: 2026,
      }),
    ).rejects.toMatchObject({
      code: "DUPLICATE_TOURNAMENT_YEAR",
    });
  });
});
