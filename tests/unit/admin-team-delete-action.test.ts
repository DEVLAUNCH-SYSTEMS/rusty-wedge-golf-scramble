import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteTeamAction } from "@/lib/actions/admin-teams";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const deleteTeam = vi.fn();

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

vi.mock("@/lib/services/teams", () => ({
  deleteTeam: (...args: unknown[]) => deleteTeam(...args),
}));

describe("deleteTeamAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    deleteTeam.mockResolvedValue({
      memberCount: 0,
      teamName: "Team Alpha",
      teamNumber: null,
    });
  });

  it("rejects unauthenticated requests before calling deleteTeam", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    const formData = new FormData();
    formData.set("teamId", "team-1");

    await expect(deleteTeamAction(formData)).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
    expect(deleteTeam).not.toHaveBeenCalled();
  });

  it("rejects forbidden admin sessions before calling deleteTeam", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
    );

    const formData = new FormData();
    formData.set("teamId", "team-1");

    await expect(deleteTeamAction(formData)).resolves.toEqual({
      ok: false,
      message: "Admin access is not granted.",
    });
    expect(deleteTeam).not.toHaveBeenCalled();
  });

  it("requires teamId in form data", async () => {
    await expect(deleteTeamAction(new FormData())).resolves.toEqual({
      ok: false,
      message: "Team is required.",
    });
    expect(deleteTeam).not.toHaveBeenCalled();
  });

  it("requires confirmAcknowledged before calling deleteTeam", async () => {
    const formData = new FormData();
    formData.set("teamId", "team-1");

    await expect(deleteTeamAction(formData)).resolves.toEqual({
      ok: false,
      message: "Confirm that you understand this action before deleting.",
    });
    expect(deleteTeam).not.toHaveBeenCalled();
  });
});
