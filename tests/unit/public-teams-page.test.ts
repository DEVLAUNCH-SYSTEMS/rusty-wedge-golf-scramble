import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadPublicTeamsPageData } from "@/lib/services/public-teams-page";

const getActiveTournament = vi.fn();
const listPublicTeams = vi.fn();

vi.mock("@/lib/services/tournament", () => ({
  getActiveTournament: (...args: unknown[]) => getActiveTournament(...args),
}));

vi.mock("@/lib/services/public-teams-list", () => ({
  listPublicTeams: (...args: unknown[]) => listPublicTeams(...args),
}));

function activeTournament(teamsPublished: boolean) {
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
    lifecycleStatus: "registration_open" as const,
    registrationOpensAt: null,
    registrationClosesAt: null,
    archivedAt: null,
    archivedByAdminId: null,
    teamsPublished,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("loadPublicTeamsPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicTeams.mockResolvedValue([]);
  });

  it("returns no_tournament when the active tournament is missing", async () => {
    getActiveTournament.mockResolvedValue(null);

    await expect(loadPublicTeamsPageData()).resolves.toEqual({
      status: "no_tournament",
    });
    expect(listPublicTeams).not.toHaveBeenCalled();
  });

  it("returns not_published without querying roster data", async () => {
    getActiveTournament.mockResolvedValue(activeTournament(false));

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("not_published");
    expect(listPublicTeams).not.toHaveBeenCalled();

    if (pageData.status === "not_published") {
      expect(pageData.tournament.name).toBe("Rusty Wedge");
    }
  });

  it("loads public teams when publication is enabled", async () => {
    getActiveTournament.mockResolvedValue(activeTournament(true));
    listPublicTeams.mockResolvedValue([
      { teamNumber: 1, players: [{ firstName: "Amy", lastName: "Smith" }] },
    ]);

    const pageData = await loadPublicTeamsPageData();

    expect(pageData.status).toBe("published");
    expect(listPublicTeams).toHaveBeenCalledWith("tournament-1");

    if (pageData.status === "published") {
      expect(pageData.teams).toHaveLength(1);
    }
  });
});
