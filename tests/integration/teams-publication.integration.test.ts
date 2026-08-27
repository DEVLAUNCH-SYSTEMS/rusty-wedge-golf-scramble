import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { ServiceError } from "@/lib/services/service-error";
import {
  hideTeams,
  publishTeams,
} from "@/lib/services/teams-publication";
import { requireActiveTournament } from "@/lib/services/tournament";

import { createTestAdminSession } from "./helpers";

const createdTournamentIds: string[] = [];

function mockActiveTournamentContext() {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(null);
}

async function readTeamsPublished(tournamentId: string): Promise<boolean> {
  const db = getDb();
  const row = (
    await db
      .select({ teamsPublished: tournaments.teamsPublished })
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Tournament not found.");
  }

  return row.teamsPublished;
}

async function withArchivedActiveTournament(
  run: () => Promise<void>,
): Promise<void> {
  const tournament = await requireActiveTournament();
  const db = getDb();

  try {
    await db
      .update(tournaments)
      .set({ lifecycleStatus: "archived" })
      .where(eq(tournaments.id, tournament.id));

    await run();
  } finally {
    await db
      .update(tournaments)
      .set({ lifecycleStatus: tournament.lifecycleStatus })
      .where(eq(tournaments.id, tournament.id));
  }
}

async function insertIsolatedTournament(): Promise<string> {
  const db = getDb();
  const tournament = (
    await db
      .insert(tournaments)
      .values({
        name: "Publication Scope Test",
        slug: `publication-scope-${randomUUID()}`,
        year: 2098,
        eventDate: "2098-06-01",
        locationName: "Scope Test Course",
        venmoHandle: "@pubscope",
        registrationEnabled: false,
        isActive: false,
        lifecycleStatus: "registration_closed",
        teamsPublished: false,
      })
      .returning({ id: tournaments.id })
  )[0];

  if (!tournament) {
    throw new Error("Unable to insert publication scope tournament.");
  }

  createdTournamentIds.push(tournament.id);
  return tournament.id;
}

afterEach(async () => {
  vi.restoreAllMocks();

  const db = getDb();
  const active = await requireActiveTournament();

  await db
    .update(tournaments)
    .set({ teamsPublished: false, lifecycleStatus: active.lifecycleStatus })
    .where(eq(tournaments.id, active.id));

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }
});

describe.skipIf(!hasIntegrationDatabase())("teams publication integration", () => {
  it("publishes teams for the admin tournament context and records audit evidence", async () => {
    mockActiveTournamentContext();

    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();

    expect(await readTeamsPublished(active.id)).toBe(false);

    const result = await publishTeams(admin);

    expect(result).toEqual({
      tournamentId: active.id,
      teamsPublished: true,
    });
    expect(await readTeamsPublished(active.id)).toBe(true);

    const events = await getDb()
      .select({ eventType: registrationEvents.eventType })
      .from(registrationEvents)
      .where(eq(registrationEvents.tournamentId, active.id));

    expect(
      events.some((event) => event.eventType === AUDIT_EVENT_TYPES.teamsPublished),
    ).toBe(true);
  });

  it("hides published teams and records an unpublished audit event", async () => {
    mockActiveTournamentContext();

    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();

    await publishTeams(admin);

    const result = await hideTeams(admin);

    expect(result).toEqual({
      tournamentId: active.id,
      teamsPublished: false,
    });
    expect(await readTeamsPublished(active.id)).toBe(false);

    const events = await getDb()
      .select({ eventType: registrationEvents.eventType })
      .from(registrationEvents)
      .where(eq(registrationEvents.tournamentId, active.id));

    expect(
      events.some((event) => event.eventType === AUDIT_EVENT_TYPES.teamsUnpublished),
    ).toBe(true);
  });

  it("blocks publish and hide when the tournament is archived", async () => {
    mockActiveTournamentContext();

    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();

    await withArchivedActiveTournament(async () => {
      await expect(publishTeams(admin)).rejects.toMatchObject({
        code: "TOURNAMENT_ARCHIVED",
      } satisfies Partial<ServiceError>);

      await expect(hideTeams(admin)).rejects.toMatchObject({
        code: "TOURNAMENT_ARCHIVED",
      } satisfies Partial<ServiceError>);
    });

    expect(await readTeamsPublished(active.id)).toBe(false);
  });

  it("allows publish when lifecycle is completed", async () => {
    mockActiveTournamentContext();

    const admin = await createTestAdminSession();
    const db = getDb();
    const active = await requireActiveTournament();
    const originalStatus = active.lifecycleStatus;

    await db
      .update(tournaments)
      .set({ lifecycleStatus: "completed" })
      .where(eq(tournaments.id, active.id));

    const result = await publishTeams(admin);

    expect(result.teamsPublished).toBe(true);
    expect(await readTeamsPublished(active.id)).toBe(true);

    await db
      .update(tournaments)
      .set({ lifecycleStatus: originalStatus, teamsPublished: false })
      .where(eq(tournaments.id, active.id));
  });

  it("does not change publication state for unrelated tournaments", async () => {
    mockActiveTournamentContext();

    const admin = await createTestAdminSession();
    const otherTournamentId = await insertIsolatedTournament();
    const active = await requireActiveTournament();

    await publishTeams(admin);

    expect(await readTeamsPublished(active.id)).toBe(true);
    expect(await readTeamsPublished(otherTournamentId)).toBe(false);
  });
});
