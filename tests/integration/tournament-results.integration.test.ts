import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, teams, tournaments } from "@/lib/db/schema";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { setBulkTeamFinishingPlacements } from "@/lib/services/bulk-team-finishing-placement";
import { hideResults, publishResults } from "@/lib/services/results-publication";
import { ServiceError } from "@/lib/services/service-error";
import { setTeamFinishingPlacement } from "@/lib/services/team-finishing-placement";
import { requireActiveTournament } from "@/lib/services/tournament";

import {
  createIntegrationTeam,
  createTestAdminSession,
  insertDisposableTournament,
  withDisposableWritableActiveTournament,
} from "./helpers";

function mockActiveTournamentContext() {
  vi.spyOn(
    adminTournamentContextCookie,
    "readAdminTournamentContextCookie",
  ).mockResolvedValue(null);
}

async function setActiveLifecycle(
  tournamentId: string,
  lifecycleStatus: "registration_open" | "registration_closed" | "completed" | "archived",
): Promise<void> {
  const db = getDb();

  await db
    .update(tournaments)
    .set({ lifecycleStatus })
    .where(eq(tournaments.id, tournamentId));
}

async function readFinishingPlacement(teamId: string): Promise<number | null> {
  const db = getDb();
  const row = (
    await db
      .select({ finishingPlacement: teams.finishingPlacement })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Team not found.");
  }

  return row.finishingPlacement;
}

async function readResultsPublished(tournamentId: string): Promise<boolean> {
  const db = getDb();
  const row = (
    await db
      .select({ resultsPublished: tournaments.resultsPublished })
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Tournament not found.");
  }

  return row.resultsPublished;
}

afterEach(async () => {
  vi.restoreAllMocks();

  if (!hasIntegrationDatabase()) {
    return;
  }

  const db = getDb();
  const active = await requireActiveTournament();

  await db
    .update(tournaments)
    .set({ resultsPublished: false, lifecycleStatus: active.lifecycleStatus })
    .where(eq(tournaments.id, active.id));
});

describe.skipIf(!hasIntegrationDatabase())("team finishing placement integration", () => {
  it("assigns, edits, and clears placement on the active tournament", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");

      const team = await createIntegrationTeam(admin);

      await expect(
        setTeamFinishingPlacement(admin, team.id, 2),
      ).resolves.toEqual({
        teamId: team.id,
        finishingPlacement: 2,
      });
      expect(await readFinishingPlacement(team.id)).toBe(2);

      await setTeamFinishingPlacement(admin, team.id, 1);
      expect(await readFinishingPlacement(team.id)).toBe(1);

      await setTeamFinishingPlacement(admin, team.id, null);
      expect(await readFinishingPlacement(team.id)).toBeNull();
    });
  });

  it("allows duplicate placements for ties", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "completed");

      const firstTeam = await createIntegrationTeam(admin);
      const secondTeam = await createIntegrationTeam(admin);

      await setTeamFinishingPlacement(admin, firstTeam.id, 1);
      await setTeamFinishingPlacement(admin, secondTeam.id, 1);

      expect(await readFinishingPlacement(firstTeam.id)).toBe(1);
      expect(await readFinishingPlacement(secondTeam.id)).toBe(1);
    });
  });

  it("records audit events for set and clear", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");

      const team = await createIntegrationTeam(admin);

      await setTeamFinishingPlacement(admin, team.id, 3);

      const events = await getDb()
        .select({ eventType: registrationEvents.eventType })
        .from(registrationEvents)
        .where(eq(registrationEvents.tournamentId, tournamentId));

      expect(
        events.some(
          (event) => event.eventType === AUDIT_EVENT_TYPES.teamFinishingPlacementSet,
        ),
      ).toBe(true);

      await setTeamFinishingPlacement(admin, team.id, null);

      const clearedEvents = await getDb()
        .select({ eventType: registrationEvents.eventType })
        .from(registrationEvents)
        .where(eq(registrationEvents.tournamentId, tournamentId));

      expect(
        clearedEvents.some(
          (event) =>
            event.eventType === AUDIT_EVENT_TYPES.teamFinishingPlacementCleared,
        ),
      ).toBe(true);
    });
  });

  it("rejects placement during registration_open", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async () => {
      const team = await createIntegrationTeam(admin);

      await expect(setTeamFinishingPlacement(admin, team.id, 1)).rejects.toMatchObject({
        code: "FINISHING_PLACEMENT_NOT_ALLOWED",
      } satisfies Partial<ServiceError>);
    });
  });

  it("rejects placement on a non-active tournament view", async () => {
    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();
    const otherTournamentId = await insertDisposableTournament({
      name: "Placement Scope Test",
      slugPrefix: "placement-scope",
      lifecycleStatus: "completed",
    });

    const db = getDb();
    const otherTeam = (
      await db
        .insert(teams)
        .values({
          tournamentId: otherTournamentId,
          teamNumber: 1,
          name: "Team #1",
        })
        .returning({ id: teams.id })
    )[0];

    vi.spyOn(
      adminTournamentContextCookie,
      "readAdminTournamentContextCookie",
    ).mockResolvedValue(otherTournamentId);

    await expect(
      setTeamFinishingPlacement(admin, otherTeam!.id, 1),
    ).rejects.toMatchObject({
      code: "TOURNAMENT_NOT_ACTIVE",
    } satisfies Partial<ServiceError>);

    expect(await readFinishingPlacement(otherTeam!.id)).toBeNull();

    await db
      .update(tournaments)
      .set({ lifecycleStatus: active.lifecycleStatus })
      .where(eq(tournaments.id, active.id));
  });

  it("rejects placement when the active tournament is archived", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();
    const originalStatus = active.lifecycleStatus;

    const db = getDb();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");
      const team = await createIntegrationTeam(admin);

      await db
        .update(tournaments)
        .set({ lifecycleStatus: "archived" })
        .where(eq(tournaments.id, tournamentId));

      await expect(setTeamFinishingPlacement(admin, team.id, 1)).rejects.toMatchObject({
        code: "TOURNAMENT_ARCHIVED",
      } satisfies Partial<ServiceError>);
    });

    await db
      .update(tournaments)
      .set({ lifecycleStatus: originalStatus })
      .where(eq(tournaments.id, active.id));
  });
});

describe.skipIf(!hasIntegrationDatabase())("bulk team finishing placement integration", () => {
  it("saves multiple placements, updates existing values, and clears blanks", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");

      const teamOne = await createIntegrationTeam(admin);
      const teamTwo = await createIntegrationTeam(admin);

      await setBulkTeamFinishingPlacements(admin, [
        { teamId: teamOne.id, finishingPlacement: 1 },
        { teamId: teamTwo.id, finishingPlacement: 1 },
      ]);

      expect(await readFinishingPlacement(teamOne.id)).toBe(1);
      expect(await readFinishingPlacement(teamTwo.id)).toBe(1);
      expect(await readResultsPublished(tournamentId)).toBe(false);

      await setBulkTeamFinishingPlacements(admin, [
        { teamId: teamOne.id, finishingPlacement: 2 },
        { teamId: teamTwo.id, finishingPlacement: null },
      ]);

      expect(await readFinishingPlacement(teamOne.id)).toBe(2);
      expect(await readFinishingPlacement(teamTwo.id)).toBeNull();
    });
  });

  it("rejects invalid values before persisting any placement changes", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");

      const teamOne = await createIntegrationTeam(admin);
      const teamTwo = await createIntegrationTeam(admin);

      await expect(
        setBulkTeamFinishingPlacements(admin, [
          { teamId: teamOne.id, finishingPlacement: 1 },
          { teamId: teamTwo.id, finishingPlacement: 0 },
        ]),
      ).rejects.toThrow();

      expect(await readFinishingPlacement(teamOne.id)).toBeNull();
      expect(await readFinishingPlacement(teamTwo.id)).toBeNull();
    });
  });

  it("blocks bulk placement while registration is open", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async () => {
      const team = await createIntegrationTeam(admin);

      await expect(
        setBulkTeamFinishingPlacements(admin, [
          { teamId: team.id, finishingPlacement: 1 },
        ]),
      ).rejects.toMatchObject({
        code: "FINISHING_PLACEMENT_NOT_ALLOWED",
      } satisfies Partial<ServiceError>);
    });
  });
});

describe.skipIf(!hasIntegrationDatabase())("results publication integration", () => {
  it("publishes and hides results with audit evidence", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();

    expect(await readResultsPublished(active.id)).toBe(false);

    const published = await publishResults(admin);

    expect(published).toEqual({
      tournamentId: active.id,
      resultsPublished: true,
    });
    expect(await readResultsPublished(active.id)).toBe(true);

    const events = await getDb()
      .select({ eventType: registrationEvents.eventType })
      .from(registrationEvents)
      .where(eq(registrationEvents.tournamentId, active.id));

    expect(
      events.some((event) => event.eventType === AUDIT_EVENT_TYPES.resultsPublished),
    ).toBe(true);

    const hidden = await hideResults(admin);

    expect(hidden.resultsPublished).toBe(false);
    expect(await readResultsPublished(active.id)).toBe(false);
  });

  it("blocks publish and hide when the tournament is archived", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();
    const active = await requireActiveTournament();
    const originalStatus = active.lifecycleStatus;
    const db = getDb();

    await db
      .update(tournaments)
      .set({ lifecycleStatus: "archived" })
      .where(eq(tournaments.id, active.id));

    await expect(publishResults(admin)).rejects.toMatchObject({
      code: "TOURNAMENT_ARCHIVED",
    } satisfies Partial<ServiceError>);

    await db
      .update(tournaments)
      .set({ lifecycleStatus: originalStatus, resultsPublished: false })
      .where(eq(tournaments.id, active.id));
  });

  it("does not change publication state for unrelated tournaments", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();
    const otherTournamentId = await insertDisposableTournament({
      name: "Results Scope Test",
      slugPrefix: "results-scope",
      lifecycleStatus: "completed",
    });
    const active = await requireActiveTournament();

    await publishResults(admin);

    expect(await readResultsPublished(active.id)).toBe(true);
    expect(await readResultsPublished(otherTournamentId)).toBe(false);

    await hideResults(admin);
  });
});
