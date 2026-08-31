import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearTeamFinishingPlacementAction,
  setTeamFinishingPlacementAction,
} from "@/lib/actions/admin-team-finishing-placement";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const setTeamFinishingPlacement = vi.fn();

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

vi.mock("@/lib/services/team-finishing-placement", () => ({
  setTeamFinishingPlacement: (...args: unknown[]) =>
    setTeamFinishingPlacement(...args),
}));

function placementFormData(placement: string): FormData {
  const formData = new FormData();
  formData.set("finishingPlacement", placement);
  return formData;
}

describe("team finishing placement actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    setTeamFinishingPlacement.mockResolvedValue({
      teamId: "team-1",
      finishingPlacement: 1,
    });
  });

  it("rejects missing placement input", async () => {
    await expect(setTeamFinishingPlacementAction("team-1", new FormData())).resolves.toEqual({
      ok: false,
      message: "Enter a finishing placement of at least 1.",
    });
    expect(setTeamFinishingPlacement).not.toHaveBeenCalled();
  });

  it("saves placement through the service", async () => {
    await expect(
      setTeamFinishingPlacementAction("team-1", placementFormData("2")),
    ).resolves.toEqual({
      ok: true,
      message: "Finishing placement saved.",
    });
    expect(setTeamFinishingPlacement).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      "team-1",
      2,
    );
  });

  it("clears placement through the service", async () => {
    setTeamFinishingPlacement.mockResolvedValue({
      teamId: "team-1",
      finishingPlacement: null,
    });

    await expect(clearTeamFinishingPlacementAction("team-1")).resolves.toEqual({
      ok: true,
      message: "Finishing placement cleared.",
    });
    expect(setTeamFinishingPlacement).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      "team-1",
      null,
    );
  });

  it("maps service validation errors to action failures", async () => {
    const { ServiceError } = await import("@/lib/services/service-error");
    setTeamFinishingPlacement.mockRejectedValue(
      new ServiceError(
        "FINISHING_PLACEMENT_NOT_ALLOWED",
        "Finishing placement can only be entered after registration closes.",
      ),
    );

    await expect(
      setTeamFinishingPlacementAction("team-1", placementFormData("1")),
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
      setTeamFinishingPlacementAction("team-1", placementFormData("1")),
    ).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
  });
});
