import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

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

  it("returns zod validation messages to the client", () => {
    const result = mapAdminActionError(
      new ZodError([
        {
          code: "custom",
          path: ["email"],
          message: "Invalid email",
        },
      ]),
      "test",
    );

    expect(result).toEqual({
      ok: false,
      message: "Invalid email",
    });
  });

  it("returns profile duplicate and archived errors to the client", () => {
    expect(
      mapAdminActionError(
        new ServiceError(
          "DUPLICATE_EMAIL",
          "Another registration already uses this email.",
        ),
        "test",
      ),
    ).toEqual({
      ok: false,
      message: "Another registration already uses this email.",
    });

    expect(
      mapAdminActionError(
        new ServiceError(
          "TOURNAMENT_ARCHIVED",
          "This tournament is archived and cannot be modified.",
        ),
        "test",
      ),
    ).toEqual({
      ok: false,
      message: "This tournament is archived and cannot be modified.",
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
