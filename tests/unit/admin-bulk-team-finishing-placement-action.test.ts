import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveBulkTeamFinishingPlacementsAction } from "@/lib/actions/admin-bulk-team-finishing-placement";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const setBulkTeamFinishingPlacements = vi.fn();
const publishResults = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/actions/revalidate-public-teams-surfaces", () => ({
  revalidatePublicTeamsSurfacesIfVisible: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/services/admin-auth", () => ({
  AdminAuthError: class AdminAuthError extends Error {
    readonly code: "UNAUTHENTICATED" | "FORBIDDEN";

    constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
      super(message);
      this.name = "AdminAuthError";
      this.code = code;
    }
  },
  requireAdminSession: (...args: unknown[]) => requireAdminSession(...args),
}));

vi.mock("@/lib/services/bulk-team-finishing-placement", () => ({
  setBulkTeamFinishingPlacements: (...args: unknown[]) =>
    setBulkTeamFinishingPlacements(...args),
}));

vi.mock("@/lib/services/results-publication", () => ({
  publishResults: (...args: unknown[]) => publishResults(...args),
}));

const TEAM_ONE = "11111111-1111-4111-8111-111111111111";
const TEAM_TWO = "22222222-2222-4222-8222-222222222222";

function bulkFormData(
  entries: Array<{ teamId: string; placement: string }>,
): FormData {
  const formData = new FormData();

  for (const entry of entries) {
    formData.append("teamIds", entry.teamId);
    formData.set(`placement_${entry.teamId}`, entry.placement);
  }

  return formData;
}

describe("saveBulkTeamFinishingPlacementsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    setBulkTeamFinishingPlacements.mockResolvedValue({ updatedCount: 2 });
  });

  it("saves multiple placements through the bulk service", async () => {
    await expect(
      saveBulkTeamFinishingPlacementsAction(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "1" },
          { teamId: TEAM_TWO, placement: "2" },
        ]),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "Saved 2 placement changes.",
    });

    expect(setBulkTeamFinishingPlacements).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      [
        { teamId: TEAM_ONE, finishingPlacement: 1 },
        { teamId: TEAM_TWO, finishingPlacement: 2 },
      ],
    );
    expect(publishResults).not.toHaveBeenCalled();
  });

  it("allows ties and clearing placements in one submission", async () => {
    setBulkTeamFinishingPlacements.mockResolvedValue({ updatedCount: 2 });

    await expect(
      saveBulkTeamFinishingPlacementsAction(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "1" },
          { teamId: TEAM_TWO, placement: "1" },
        ]),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "Saved 2 placement changes.",
    });

    expect(setBulkTeamFinishingPlacements).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      [
        { teamId: TEAM_ONE, finishingPlacement: 1 },
        { teamId: TEAM_TWO, finishingPlacement: 1 },
      ],
    );
  });

  it("rejects invalid placement values before calling the service", async () => {
    await expect(
      saveBulkTeamFinishingPlacementsAction(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "0" },
          { teamId: TEAM_TWO, placement: "2" },
        ]),
      ),
    ).resolves.toEqual({
      ok: false,
      message: expect.stringContaining("at least 1"),
    });
    expect(setBulkTeamFinishingPlacements).not.toHaveBeenCalled();
  });

  it("maps lifecycle blocking errors from the service", async () => {
    const { ServiceError } = await import("@/lib/services/service-error");
    setBulkTeamFinishingPlacements.mockRejectedValue(
      new ServiceError(
        "FINISHING_PLACEMENT_NOT_ALLOWED",
        "Finishing placement can only be entered after registration closes.",
      ),
    );

    await expect(
      saveBulkTeamFinishingPlacementsAction(
        bulkFormData([{ teamId: TEAM_ONE, placement: "1" }]),
      ),
    ).resolves.toEqual({
      ok: false,
      message: "Finishing placement can only be entered after registration closes.",
    });
  });

  it("rejects unauthenticated requests", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    await expect(
      saveBulkTeamFinishingPlacementsAction(
        bulkFormData([{ teamId: TEAM_ONE, placement: "1" }]),
      ),
    ).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
  });

  it("reports when no placement changes were submitted", async () => {
    setBulkTeamFinishingPlacements.mockResolvedValue({ updatedCount: 0 });

    await expect(
      saveBulkTeamFinishingPlacementsAction(
        bulkFormData([{ teamId: TEAM_ONE, placement: "1" }]),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "No placement changes to save.",
    });
  });
});
