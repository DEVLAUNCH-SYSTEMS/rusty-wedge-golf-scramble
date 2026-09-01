import { beforeEach, describe, expect, it, vi } from "vitest";

import { setTeamResultsAction } from "@/lib/actions/admin-team-results";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const setTeamResults = vi.fn();
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

vi.mock("@/lib/services/team-finishing-placement", () => ({
  setTeamResults: (...args: unknown[]) => setTeamResults(...args),
}));

vi.mock("@/lib/services/results-publication", () => ({
  publishResults: (...args: unknown[]) => publishResults(...args),
}));

function teamResultsFormData(fields: {
  finishingPlacement?: string;
  scoreRelativeToPar?: string;
  scoreTotalStrokes?: string;
}): FormData {
  const formData = new FormData();

  if (fields.finishingPlacement !== undefined) {
    formData.set("finishingPlacement", fields.finishingPlacement);
  }

  if (fields.scoreRelativeToPar !== undefined) {
    formData.set("scoreRelativeToPar", fields.scoreRelativeToPar);
  }

  if (fields.scoreTotalStrokes !== undefined) {
    formData.set("scoreTotalStrokes", fields.scoreTotalStrokes);
  }

  return formData;
}

describe("setTeamResultsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    setTeamResults.mockResolvedValue({
      teamId: "team-1",
      finishingPlacement: 1,
      scoreRelativeToPar: -7,
      scoreTotalStrokes: 64,
    });
  });

  it("saves score-only corrections", async () => {
    await expect(
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          scoreRelativeToPar: "-7",
          scoreTotalStrokes: "64",
        }),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "Team results saved.",
    });

    expect(setTeamResults).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      "team-1",
      {
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      },
    );
    expect(publishResults).not.toHaveBeenCalled();
  });

  it("saves placement and score together", async () => {
    await expect(
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          finishingPlacement: "1",
          scoreRelativeToPar: "0",
          scoreTotalStrokes: "71",
        }),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "Team results saved.",
    });

    expect(setTeamResults).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      "team-1",
      {
        finishingPlacement: 1,
        scoreRelativeToPar: 0,
        scoreTotalStrokes: 71,
      },
    );
  });

  it("accepts golf even notation for relative-to-par", async () => {
    await expect(
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          scoreRelativeToPar: "E",
          scoreTotalStrokes: "67",
        }),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "Team results saved.",
    });

    expect(setTeamResults).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      "team-1",
      {
        scoreRelativeToPar: 0,
        scoreTotalStrokes: 67,
      },
    );
  });

  it("clears score fields independently", async () => {
    await expect(
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          scoreRelativeToPar: "",
          scoreTotalStrokes: "",
        }),
      ),
    ).resolves.toEqual({
      ok: true,
      message: "Team results saved.",
    });

    expect(setTeamResults).toHaveBeenCalledWith(
      expect.objectContaining({ adminUserId: "admin-1" }),
      "team-1",
      {
        scoreRelativeToPar: null,
        scoreTotalStrokes: null,
      },
    );
  });

  it("rejects invalid strokes before calling the service", async () => {
    await expect(
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          scoreTotalStrokes: "0",
        }),
      ),
    ).resolves.toEqual({
      ok: false,
      message: expect.stringContaining("at least 1"),
    });
    expect(setTeamResults).not.toHaveBeenCalled();
  });

  it("maps lifecycle blocking errors from the service", async () => {
    const { ServiceError } = await import("@/lib/services/service-error");
    setTeamResults.mockRejectedValue(
      new ServiceError(
        "FINISHING_PLACEMENT_NOT_ALLOWED",
        "Finishing placement can only be entered after registration closes.",
      ),
    );

    await expect(
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          scoreRelativeToPar: "2",
        }),
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
      setTeamResultsAction(
        "team-1",
        teamResultsFormData({
          scoreRelativeToPar: "1",
        }),
      ),
    ).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
  });
});
