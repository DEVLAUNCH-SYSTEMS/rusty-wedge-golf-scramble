import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, teams, tournaments } from "@/lib/db/schema";
import * as adminTournamentContextCookie from "@/lib/services/admin-tournament-context-cookie";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { setBulkTeamFinishingPlacements } from "@/lib/services/bulk-team-finishing-placement";
import { listPublicResults } from "@/lib/services/public-results-list";
import { publishResults } from "@/lib/services/results-publication";
import {
  setTeamFinishingPlacement,
  setTeamResults,
} from "@/lib/services/team-finishing-placement";
import { requireActiveTournament } from "@/lib/services/tournament";

import {
  createIntegrationTeam,
  createTestAdminSession,
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
  lifecycleStatus: "registration_closed" | "completed",
): Promise<void> {
  const db = getDb();

  await db
    .update(tournaments)
    .set({ lifecycleStatus })
    .where(eq(tournaments.id, tournamentId));
}

async function readTeamResults(teamId: string) {
  const db = getDb();
  const row = (
    await db
      .select({
        finishingPlacement: teams.finishingPlacement,
        scoreRelativeToPar: teams.scoreRelativeToPar,
        scoreTotalStrokes: teams.scoreTotalStrokes,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Team not found.");
  }

  return row;
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

describe.skipIf(!hasIntegrationDatabase())("team results score integration", () => {
  it("sets, edits, and clears score fields independently of placement", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");
      const team = await createIntegrationTeam(admin);

      await setTeamResults(admin, team.id, {
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      });

      expect(await readTeamResults(team.id)).toEqual({
        finishingPlacement: null,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      });

      await setTeamResults(admin, team.id, {
        finishingPlacement: 1,
      });

      expect(await readTeamResults(team.id)).toEqual({
        finishingPlacement: 1,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      });

      await setTeamResults(admin, team.id, {
        scoreRelativeToPar: null,
        scoreTotalStrokes: null,
      });

      expect(await readTeamResults(team.id)).toEqual({
        finishingPlacement: 1,
        scoreRelativeToPar: null,
        scoreTotalStrokes: null,
      });
    });
  });

  it("does not change results_published when saving scores", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");
      const team = await createIntegrationTeam(admin);

      await publishResults(admin);
      expect(await readResultsPublished(tournamentId)).toBe(true);

      await setTeamResults(admin, team.id, {
        scoreRelativeToPar: 2,
        scoreTotalStrokes: 73,
      });

      expect(await readResultsPublished(tournamentId)).toBe(true);
    });
  });

  it("bulk-saves score changes transactionally without clearing omitted score fields", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");
      const firstTeam = await createIntegrationTeam(admin);
      const secondTeam = await createIntegrationTeam(admin);

      await setTeamResults(admin, firstTeam.id, {
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      });

      await setBulkTeamFinishingPlacements(admin, [
        { teamId: firstTeam.id, finishingPlacement: 1 },
        { teamId: secondTeam.id, finishingPlacement: 2 },
      ]);

      expect(await readTeamResults(firstTeam.id)).toEqual({
        finishingPlacement: 1,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      });
    });
  });

  it("returns score fields on public results only for placed teams", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");
      const placedTeam = await createIntegrationTeam(admin);
      const unplacedScoredTeam = await createIntegrationTeam(admin);

      await setTeamResults(admin, placedTeam.id, {
        finishingPlacement: 1,
        scoreRelativeToPar: 0,
        scoreTotalStrokes: 71,
      });
      await setTeamResults(admin, unplacedScoredTeam.id, {
        scoreRelativeToPar: -3,
        scoreTotalStrokes: 68,
      });

      const listed = await listPublicResults(tournamentId);

      expect(listed).toHaveLength(1);
      expect(listed[0]?.teamNumber).toBe(placedTeam.teamNumber);
      expect(listed[0]?.scoreRelativeToPar).toBe(0);
      expect(listed[0]?.scoreTotalStrokes).toBe(71);
    });
  });

  it("records score audit events", async () => {
    mockActiveTournamentContext();
    const admin = await createTestAdminSession();

    await withDisposableWritableActiveTournament(async (tournamentId) => {
      await setActiveLifecycle(tournamentId, "registration_closed");
      const team = await createIntegrationTeam(admin);

      await setTeamResults(admin, team.id, {
        scoreRelativeToPar: 2,
        scoreTotalStrokes: 73,
      });

      const db = getDb();
      const events = await db
        .select({ eventType: registrationEvents.eventType })
        .from(registrationEvents)
        .where(eq(registrationEvents.teamId, team.id));

      expect(
        events.some((event) => event.eventType === AUDIT_EVENT_TYPES.teamScoreSet),
      ).toBe(true);

      await setTeamFinishingPlacement(admin, team.id, 1);
      await setTeamResults(admin, team.id, {
        scoreRelativeToPar: null,
        scoreTotalStrokes: null,
      });

      const clearedEvents = await db
        .select({ eventType: registrationEvents.eventType })
        .from(registrationEvents)
        .where(eq(registrationEvents.teamId, team.id));

      expect(
        clearedEvents.some(
          (event) => event.eventType === AUDIT_EVENT_TYPES.teamScoreCleared,
        ),
      ).toBe(true);
    });
  });
});
