import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { teams } from "@/lib/db/schema";
import { listPublicResults } from "@/lib/services/public-results-list";

import { insertDisposableTournament } from "./helpers";

async function insertResultsFixtureTournament(): Promise<string> {
  const tournamentId = await insertDisposableTournament({
    name: "Public Results List Test",
    slugPrefix: "public-results-list",
    year: 2097,
    eventDate: "2097-06-01",
    locationName: "Results Test Course",
    venmoHandle: "@publicresults",
  });

  const db = getDb();

  await db.insert(teams).values([
    {
      tournamentId,
      teamNumber: 3,
      name: "Team #3",
      finishingPlacement: 2,
      scoreRelativeToPar: 2,
      scoreTotalStrokes: 73,
    },
    {
      tournamentId,
      teamNumber: 1,
      name: "Team #1",
      finishingPlacement: 1,
      scoreRelativeToPar: 0,
      scoreTotalStrokes: 71,
    },
    {
      tournamentId,
      teamNumber: 2,
      name: "Team #2",
      finishingPlacement: 1,
      scoreRelativeToPar: -7,
      scoreTotalStrokes: 64,
    },
    {
      tournamentId,
      teamNumber: 4,
      name: "Team #4",
      finishingPlacement: null,
      scoreRelativeToPar: -3,
      scoreTotalStrokes: 68,
    },
  ]);

  return tournamentId;
}

describe.skipIf(!hasIntegrationDatabase())("public results list integration", () => {
  it("returns only placed teams sorted by placement then team number", async () => {
    const tournamentId = await insertResultsFixtureTournament();
    const listed = await listPublicResults(tournamentId);

    expect(listed.map((team) => team.teamNumber)).toEqual([1, 2, 3]);
    expect(listed.map((team) => team.finishingPlacement)).toEqual([1, 1, 2]);
    expect(listed.every((team) => team.finishingPlacement !== undefined)).toBe(true);
  });

  it("excludes teams without finishing placement", async () => {
    const tournamentId = await insertResultsFixtureTournament();
    const listed = await listPublicResults(tournamentId);

    expect(listed.some((team) => team.teamNumber === 4)).toBe(false);
  });

  it("returns score fields for placed teams and preserves placement ordering", async () => {
    const tournamentId = await insertResultsFixtureTournament();
    const listed = await listPublicResults(tournamentId);

    expect(listed.map((team) => team.teamNumber)).toEqual([1, 2, 3]);
    expect(listed[0]).toMatchObject({
      teamNumber: 1,
      finishingPlacement: 1,
      scoreRelativeToPar: 0,
      scoreTotalStrokes: 71,
    });
    expect(listed[1]).toMatchObject({
      teamNumber: 2,
      finishingPlacement: 1,
      scoreRelativeToPar: -7,
      scoreTotalStrokes: 64,
    });
    expect(listed[2]).toMatchObject({
      teamNumber: 3,
      finishingPlacement: 2,
      scoreRelativeToPar: 2,
      scoreTotalStrokes: 73,
    });
  });
});
