import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  revalidatePublicLandingAndTeams,
  revalidatePublicLandingAndTeamsIfPublished,
} from "@/lib/actions/revalidate-public-teams-surfaces";

const revalidatePath = vi.fn();
const getActiveTournament = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

vi.mock("@/lib/services/tournament", () => ({
  getActiveTournament: (...args: unknown[]) => getActiveTournament(...args),
}));

describe("revalidatePublicLandingAndTeams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates /teams and / together", async () => {
    await revalidatePublicLandingAndTeams();

    expect(revalidatePath).toHaveBeenCalledWith("/teams");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("revalidatePublicLandingAndTeamsIfPublished", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips public revalidation when teams are unpublished", async () => {
    getActiveTournament.mockResolvedValue({ teamsPublished: false });

    await revalidatePublicLandingAndTeamsIfPublished();

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("revalidates public surfaces when teams are published", async () => {
    getActiveTournament.mockResolvedValue({ teamsPublished: true });

    await revalidatePublicLandingAndTeamsIfPublished();

    expect(revalidatePath).toHaveBeenCalledWith("/teams");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
