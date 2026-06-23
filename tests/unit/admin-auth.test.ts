import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuthError, requireAdminSession } from "@/lib/services/admin-auth";

const getSession = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ getSession }),
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

describe("requireAdminSession", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("returns UNAUTHENTICATED when getSession reports an upstream error", async () => {
    getSession.mockResolvedValue({
      data: null,
      error: { message: "Unable to connect to authentication server" },
    });

    await expect(requireAdminSession()).rejects.toEqual(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );
  });

  it("returns UNAUTHENTICATED when getSession throws", async () => {
    getSession.mockRejectedValue(new TypeError("Invalid URL"));

    await expect(requireAdminSession()).rejects.toEqual(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );
  });
});
