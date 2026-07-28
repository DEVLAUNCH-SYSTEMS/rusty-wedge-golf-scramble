import { beforeEach, describe, expect, it, vi } from "vitest";

import { activateTournamentAction } from "@/lib/actions/admin-tournament-activate";
import { createTournamentAction } from "@/lib/actions/admin-tournament-create";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const createTournament = vi.fn();
const activateTournament = vi.fn();

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

vi.mock("@/lib/services/tournament-create", () => ({
  createTournament: (...args: unknown[]) => createTournament(...args),
}));

vi.mock("@/lib/services/tournament-activate", () => ({
  activateTournament: (...args: unknown[]) => activateTournament(...args),
}));

function createTournamentFormData(
  overrides: Record<string, string> = {},
): FormData {
  const formData = new FormData();
  formData.set("year", "2028");
  formData.set("name", "The Rusty Wedge Golf Scramble");
  formData.set("slug", "2028-rusty-wedge");
  formData.set("eventDate", "2028-08-28");
  formData.set("locationName", "Deer Park Golf Course");
  formData.set("entryFeeDollars", "85.00");
  formData.set("confirmedCapacityLimit", "68");
  formData.set("venmoHandle", "@scottyrusty");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

function activateFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("tournamentId", "tournament-1");
  formData.set("confirmAcknowledged", "yes");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("admin tournament create and activate actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    createTournament.mockResolvedValue({
      id: "tournament-1",
      year: 2028,
      slug: "2028-rusty-wedge",
    });
    activateTournament.mockResolvedValue({
      id: "tournament-1",
      year: 2028,
      isActive: true,
    });
  });

  it("creates a draft tournament for authenticated admins", async () => {
    await expect(createTournamentAction(createTournamentFormData())).resolves.toEqual({
      ok: true,
      message: "Created 2028 tournament draft (2028-rusty-wedge).",
    });

    expect(createTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        lifecycleStatus: "draft",
        slug: "2028-rusty-wedge",
      }),
    );
  });

  it("rejects unauthenticated create requests", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    await expect(createTournamentAction(createTournamentFormData())).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
    expect(createTournament).not.toHaveBeenCalled();
  });

  it("activates a tournament when confirmation is provided", async () => {
    await expect(activateTournamentAction(activateFormData())).resolves.toEqual({
      ok: true,
      message: "2028 is now the active tournament on the public site.",
    });

    expect(activateTournament).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      adminUserId: "admin-1",
    });
  });

  it("rejects activation without confirmation", async () => {
    await expect(
      activateTournamentAction(activateFormData({ confirmAcknowledged: "" })),
    ).resolves.toEqual({
      ok: false,
      message: "Confirm that you understand this changes the public site.",
    });
    expect(activateTournament).not.toHaveBeenCalled();
  });
});
