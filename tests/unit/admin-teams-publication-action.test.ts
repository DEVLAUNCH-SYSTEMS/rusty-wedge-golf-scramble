import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  hideTeamsAction,
  publishTeamsAction,
} from "@/lib/actions/admin-teams-publication";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const publishTeams = vi.fn();
const hideTeams = vi.fn();

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

vi.mock("@/lib/services/teams-publication", () => ({
  publishTeams: (...args: unknown[]) => publishTeams(...args),
  hideTeams: (...args: unknown[]) => hideTeams(...args),
}));

function confirmedFormData(): FormData {
  const formData = new FormData();
  formData.set("confirmAcknowledged", "yes");
  return formData;
}

describe("teams publication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    publishTeams.mockResolvedValue({
      tournamentId: "tournament-1",
      teamsPublished: true,
    });
    hideTeams.mockResolvedValue({
      tournamentId: "tournament-1",
      teamsPublished: false,
    });
  });

  it("rejects unauthenticated publish requests before calling publishTeams", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    await expect(publishTeamsAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
    expect(publishTeams).not.toHaveBeenCalled();
  });

  it("rejects forbidden admin sessions before calling publishTeams", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
    );

    await expect(publishTeamsAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "Admin access is not granted.",
    });
    expect(publishTeams).not.toHaveBeenCalled();
  });

  it("requires publish confirmation before calling publishTeams", async () => {
    await expect(publishTeamsAction(new FormData())).resolves.toEqual({
      ok: false,
      message: "Confirm that you understand this action before publishing.",
    });
    expect(publishTeams).not.toHaveBeenCalled();
  });

  it("publishes teams after confirmation and returns success message", async () => {
    await expect(publishTeamsAction(confirmedFormData())).resolves.toEqual({
      ok: true,
      message: "Teams published.",
    });
    expect(publishTeams).toHaveBeenCalledOnce();
  });

  it("requires hide confirmation before calling hideTeams", async () => {
    await expect(hideTeamsAction(new FormData())).resolves.toEqual({
      ok: false,
      message: "Confirm that you understand this action before hiding teams.",
    });
    expect(hideTeams).not.toHaveBeenCalled();
  });

  it("hides teams after confirmation and returns success message", async () => {
    await expect(hideTeamsAction(confirmedFormData())).resolves.toEqual({
      ok: true,
      message: "Teams hidden.",
    });
    expect(hideTeams).toHaveBeenCalledOnce();
  });

  it("maps archived service errors to action failure messages", async () => {
    const { ServiceError } = await import("@/lib/services/service-error");
    publishTeams.mockRejectedValue(
      new ServiceError(
        "TOURNAMENT_ARCHIVED",
        "This tournament is archived and cannot be modified.",
      ),
    );

    await expect(publishTeamsAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "This tournament is archived and cannot be modified.",
    });
  });
});
