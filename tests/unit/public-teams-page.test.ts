import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadPublicTeamsPageData } from "@/lib/services/public-teams-page";

const getActiveTournament = vi.fn();
const listPublicTeams = vi.fn();
const listPublicResults = vi.fn();

vi.mock("@/lib/services/tournament", () => ({
  getActiveTournament: (...args: unknown[]) => getActiveTournament(...args),
}));

vi.mock("@/lib/services/public-teams-list", () => ({
  listPublicTeams: (...args: unknown[]) => listPublicTeams(...args),
}));

vi.mock("@/lib/services/public-results-list", () => ({
  listPublicResults: (...args: unknown[]) => listPublicResults(...args),
}));

function activeTournament(flags: {
  teamsPublished: boolean;
  resultsPublished: boolean;
}) {
  return {
    id: "tournament-1",
    name: "Rusty Wedge",
    slug: "2026-rusty-wedge",
    year: 2026,
    eventDate: "2026-08-28",
    teeTime: "09:00:00",
    locationName: "Test Course",
    entryFeeCents: 8500,
    confirmedCapacityLimit: 68,
    venmoHandle: "@test",
    registrationEnabled: true,
    isActive: true,
    lifecycleStatus: "completed" as const,
    registrationOpensAt: null,
    registrationClosesAt: null,
    archivedAt: null,
    archivedByAdminId: null,
    teamsPublished: flags.teamsPublished,
    resultsPublished: flags.resultsPublished,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("loadPublicTeamsPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicTeams.mockResolvedValue([]);
    listPublicResults.mockResolvedValue([]);
  });

  it("returns no_tournament when the active tournament is missing", async () => {
    getActiveTournament.mockResolvedValue(null);

    await expect(loadPublicTeamsPageData()).resolves.toEqual({
      status: "no_tournament",
    });
    expect(listPublicTeams).not.toHaveBeenCalled();
    expect(listPublicResults).not.toHaveBeenCalled();
  });

  it("returns not_published without querying team data", async () => {
    getActiveTournament.mockResolvedValue(
      activeTournament({ teamsPublished: false, resultsPublished: false }),
    );

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("not_published");
    expect(listPublicTeams).not.toHaveBeenCalled();
    expect(listPublicResults).not.toHaveBeenCalled();

    if (pageData.status === "not_published") {
      expect(pageData.tournament.name).toBe("Rusty Wedge");
      expect(pageData.publication).toEqual({
        teamsPublished: false,
        resultsPublished: false,
      });
    }
  });

  it("loads roster teams when only teams are published", async () => {
    getActiveTournament.mockResolvedValue(
      activeTournament({ teamsPublished: true, resultsPublished: false }),
    );
    listPublicTeams.mockResolvedValue([
      { teamNumber: 1, players: [{ firstName: "Amy", lastName: "Smith" }] },
    ]);

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("roster");
    expect(listPublicTeams).toHaveBeenCalledWith("tournament-1");
    expect(listPublicResults).not.toHaveBeenCalled();

    if (pageData.status === "roster") {
      expect(pageData.teams).toHaveLength(1);
    }
  });

  it("prefers results mode and loads placed teams when results are published", async () => {
    getActiveTournament.mockResolvedValue(
      activeTournament({ teamsPublished: true, resultsPublished: true }),
    );
    listPublicResults.mockResolvedValue([
      {
        teamNumber: 3,
        finishingPlacement: 1,
        players: [{ firstName: "Amy", lastName: "Smith" }],
      },
      {
        teamNumber: 8,
        finishingPlacement: 1,
        players: [{ firstName: "Bo", lastName: "Jones" }],
      },
    ]);

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("results");
    expect(listPublicResults).toHaveBeenCalledWith("tournament-1");
    expect(listPublicTeams).not.toHaveBeenCalled();

    if (pageData.status === "results") {
      expect(pageData.teams.map((team) => team.teamNumber)).toEqual([3, 8]);
    }
  });

  it("loads results mode with an empty list when no teams are placed", async () => {
    getActiveTournament.mockResolvedValue(
      activeTournament({ teamsPublished: false, resultsPublished: true }),
    );

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("results");
    expect(listPublicResults).toHaveBeenCalledWith("tournament-1");
    expect(listPublicTeams).not.toHaveBeenCalled();

    if (pageData.status === "results") {
      expect(pageData.teams).toEqual([]);
    }
  });
});
