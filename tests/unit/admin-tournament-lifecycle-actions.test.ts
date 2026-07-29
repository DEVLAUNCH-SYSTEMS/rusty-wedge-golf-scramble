import { beforeEach, describe, expect, it, vi } from "vitest";

import { transitionTournamentLifecycleAction } from "@/lib/actions/admin-tournament-lifecycle";
import { AdminAuthError } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";

const requireAdminSession = vi.fn();
const requireTournamentById = vi.fn();
const transitionTournamentLifecycle = vi.fn();

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

vi.mock("@/lib/services/tournament", () => ({
  requireTournamentById: (...args: unknown[]) => requireTournamentById(...args),
}));

vi.mock("@/lib/services/tournament-lifecycle-transition", () => ({
  transitionTournamentLifecycle: (...args: unknown[]) =>
    transitionTournamentLifecycle(...args),
}));

function lifecycleFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("tournamentId", "tournament-1");
  formData.set("toStatus", "archived");
  formData.set("confirmYear", "2026");
  formData.set("confirmAcknowledged", "yes");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe("transitionTournamentLifecycleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    requireTournamentById.mockResolvedValue({
      id: "tournament-1",
      year: 2026,
      lifecycleStatus: "completed",
    });
    transitionTournamentLifecycle.mockResolvedValue({
      id: "tournament-1",
      lifecycleStatus: "archived",
    });
  });

  it("rejects unauthenticated requests", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    await expect(
      transitionTournamentLifecycleAction(lifecycleFormData()),
    ).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
    expect(transitionTournamentLifecycle).not.toHaveBeenCalled();
  });

  it("rejects invalid transitions before calling the service", async () => {
    requireTournamentById.mockResolvedValue({
      id: "tournament-1",
      year: 2026,
      lifecycleStatus: "draft",
    });

    await expect(
      transitionTournamentLifecycleAction(
        lifecycleFormData({ toStatus: "archived" }),
      ),
    ).resolves.toEqual({
      ok: false,
      message: "Cannot transition tournament from draft to archived.",
    });
    expect(transitionTournamentLifecycle).not.toHaveBeenCalled();
  });

  it("requires archive year confirmation", async () => {
    await expect(
      transitionTournamentLifecycleAction(
        lifecycleFormData({ confirmYear: "2025" }),
      ),
    ).resolves.toEqual({
      ok: false,
      message: "Enter the tournament year to confirm archive.",
    });
    expect(transitionTournamentLifecycle).not.toHaveBeenCalled();
  });

  it("transitions when authenticated and confirmed", async () => {
    await expect(
      transitionTournamentLifecycleAction(lifecycleFormData()),
    ).resolves.toEqual({
      ok: true,
      message: "Tournament updated to Archived.",
    });
    expect(transitionTournamentLifecycle).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      toStatus: "archived",
      adminUserId: "admin-1",
    });
  });

  it("maps service errors to action failures", async () => {
    transitionTournamentLifecycle.mockRejectedValue(
      new ServiceError(
        "INVALID_LIFECYCLE_TRANSITION",
        "Cannot transition tournament from completed to registration_open.",
      ),
    );

    await expect(
      transitionTournamentLifecycleAction(lifecycleFormData()),
    ).resolves.toEqual({
      ok: false,
      message:
        "Cannot transition tournament from completed to registration_open.",
    });
  });
});
