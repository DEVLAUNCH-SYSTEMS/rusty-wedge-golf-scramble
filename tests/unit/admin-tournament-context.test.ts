import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveAdminTournamentContextForId } from "@/lib/services/admin-tournament-context";
import {
  getActiveTournament,
  getTournamentById,
} from "@/lib/services/tournament";

vi.mock("@/lib/services/tournament", () => ({
  getActiveTournament: vi.fn(),
  getTournamentById: vi.fn(),
  requireActiveTournament: vi.fn(),
  requireTournamentById: vi.fn(),
}));

const activeTournament = {
  id: "active-1",
  name: "Active Tournament",
  year: 2026,
  lifecycleStatus: "registration_open" as const,
  isActive: true,
};

const archivedTournament = {
  id: "archived-1",
  name: "Archived Tournament",
  year: 2025,
  lifecycleStatus: "archived" as const,
  isActive: false,
};

describe("resolveAdminTournamentContextForId", () => {
  beforeEach(() => {
    vi.mocked(getActiveTournament).mockResolvedValue(activeTournament as never);
  });

  it("defaults to the active tournament when no context id is provided", async () => {
    const context = await resolveAdminTournamentContextForId(null);

    expect(context).toEqual({
      tournament: activeTournament,
      isViewingActiveTournament: true,
    });
  });

  it("uses a valid non-active tournament when context id is set", async () => {
    vi.mocked(getTournamentById).mockResolvedValue(archivedTournament as never);

    const context = await resolveAdminTournamentContextForId("archived-1");

    expect(context).toEqual({
      tournament: archivedTournament,
      isViewingActiveTournament: false,
    });
  });

  it("falls back to active when the context id is unknown", async () => {
    vi.mocked(getTournamentById).mockResolvedValue(null);

    const context = await resolveAdminTournamentContextForId("missing");

    expect(context).toEqual({
      tournament: activeTournament,
      isViewingActiveTournament: true,
    });
  });

  it("marks active tournament context as viewing active", async () => {
    vi.mocked(getTournamentById).mockResolvedValue(activeTournament as never);

    const context = await resolveAdminTournamentContextForId("active-1");

    expect(context.isViewingActiveTournament).toBe(true);
  });
});
