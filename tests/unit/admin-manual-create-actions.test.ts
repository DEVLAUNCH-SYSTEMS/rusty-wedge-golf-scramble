import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAdminRegistrationAction,
  createAdminWaitlistEntryAction,
} from "@/lib/actions/admin-manual-create";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const createAdminRegistration = vi.fn();
const createAdminWaitlistEntry = vi.fn();

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

vi.mock("@/lib/services/registration-admin-create", () => ({
  createAdminRegistration: (...args: unknown[]) =>
    createAdminRegistration(...args),
}));

vi.mock("@/lib/services/waitlist-admin-create", () => ({
  createAdminWaitlistEntry: (...args: unknown[]) =>
    createAdminWaitlistEntry(...args),
}));

function registrationFormData(): FormData {
  const formData = new FormData();
  formData.set("firstName", "Pat");
  formData.set("lastName", "Player");
  formData.set("email", "pat@example.com");
  formData.set("phone", "5095550100");
  formData.set("skillLevel", "B");
  formData.set("paymentStatus", "submitted");
  return formData;
}

describe("admin manual create actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    createAdminRegistration.mockResolvedValue({ id: "reg-1" });
    createAdminWaitlistEntry.mockResolvedValue({ id: "wl-1" });
  });

  it("rejects unauthenticated registration create", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("UNAUTHENTICATED", "Authentication required."),
    );

    await expect(
      createAdminRegistrationAction(registrationFormData()),
    ).resolves.toEqual({
      ok: false,
      message: "Authentication required.",
    });
    expect(createAdminRegistration).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated waitlist create", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
    );

    await expect(
      createAdminWaitlistEntryAction(registrationFormData()),
    ).resolves.toEqual({
      ok: false,
      message: "Admin access is not granted.",
    });
    expect(createAdminWaitlistEntry).not.toHaveBeenCalled();
  });

  it("creates a registration when authenticated", async () => {
    await expect(
      createAdminRegistrationAction(registrationFormData()),
    ).resolves.toEqual({
      ok: true,
      message: "Player saved; contact them offline if needed.",
    });
    expect(createAdminRegistration).toHaveBeenCalledOnce();
  });

  it("creates a waitlist entry when authenticated", async () => {
    await expect(
      createAdminWaitlistEntryAction(registrationFormData()),
    ).resolves.toEqual({
      ok: true,
      message: "Player saved; contact them offline if needed.",
    });
    expect(createAdminWaitlistEntry).toHaveBeenCalledOnce();
  });
});
