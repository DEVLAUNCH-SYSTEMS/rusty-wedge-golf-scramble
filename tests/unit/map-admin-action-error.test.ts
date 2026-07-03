import { describe, expect, it, vi } from "vitest";

import { mapAdminActionError } from "@/lib/actions/map-admin-action-error";
import { AdminAuthError } from "@/lib/services/admin-auth";
import { ServiceError } from "@/lib/services/service-error";

vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ getSession: vi.fn() }),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
  }),
}));

describe("mapAdminActionError", () => {
  it("returns auth errors to the client", () => {
    const result = mapAdminActionError(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
      "test",
    );

    expect(result).toEqual({
      ok: false,
      message: "Admin access is not granted.",
    });
  });

  it("returns service errors to the client", () => {
    const result = mapAdminActionError(
      new ServiceError("TEAM_FULL", "Teams cannot exceed four players."),
      "test",
    );

    expect(result).toEqual({
      ok: false,
      message: "Teams cannot exceed four players.",
    });
  });

  it("returns a generic message for unexpected failures", () => {
    const result = mapAdminActionError(new Error("boom"), "test");

    expect(result).toEqual({
      ok: false,
      message: "Unable to complete that action. Please try again.",
    });
  });
});
