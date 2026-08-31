import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  hideResultsAction,
  publishResultsAction,
} from "@/lib/actions/admin-results-publication";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const publishResults = vi.fn();
const hideResults = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/actions/revalidate-public-teams-surfaces", () => ({
  revalidatePublicLandingAndTeams: vi.fn().mockResolvedValue(undefined),
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

vi.mock("@/lib/services/results-publication", () => ({
  publishResults: (...args: unknown[]) => publishResults(...args),
  hideResults: (...args: unknown[]) => hideResults(...args),
}));

function confirmedFormData(): FormData {
  const formData = new FormData();
  formData.set("confirmAcknowledged", "yes");
  return formData;
}

describe("results publication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    publishResults.mockResolvedValue({
      tournamentId: "tournament-1",
      resultsPublished: true,
    });
    hideResults.mockResolvedValue({
      tournamentId: "tournament-1",
      resultsPublished: false,
    });
  });

  it("requires publish confirmation", async () => {
    await expect(publishResultsAction(new FormData())).resolves.toEqual({
      ok: false,
      message: "Confirm that you understand this action before publishing.",
    });
    expect(publishResults).not.toHaveBeenCalled();
  });

  it("publishes results after confirmation", async () => {
    await expect(publishResultsAction(confirmedFormData())).resolves.toEqual({
      ok: true,
      message: "Results published.",
    });
    expect(publishResults).toHaveBeenCalledOnce();
  });

  it("hides results after confirmation", async () => {
    await expect(hideResultsAction(confirmedFormData())).resolves.toEqual({
      ok: true,
      message: "Results hidden.",
    });
    expect(hideResults).toHaveBeenCalledOnce();
  });

  it("maps archived service errors to action failures", async () => {
    const { ServiceError } = await import("@/lib/services/service-error");
    publishResults.mockRejectedValue(
      new ServiceError(
        "TOURNAMENT_ARCHIVED",
        "This tournament is archived and cannot be modified.",
      ),
    );

    await expect(publishResultsAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "This tournament is archived and cannot be modified.",
    });
  });

  it("rejects forbidden admin sessions", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
    );

    await expect(publishResultsAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "Admin access is not granted.",
    });
  });
});
