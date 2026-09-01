import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendResultsAnnouncementSmokeTestAction } from "@/lib/actions/admin-results-announcement-smoke-test";

const requireAdminSession = vi.fn();
const sendResultsAnnouncementSmokeTest = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

vi.mock("@/lib/services/admin-auth", () => ({
  requireAdminSession: (...args: unknown[]) => requireAdminSession(...args),
}));

vi.mock("@/lib/services/results-announcement-smoke-test", () => ({
  sendResultsAnnouncementSmokeTest: (...args: unknown[]) =>
    sendResultsAnnouncementSmokeTest(...args),
}));

function acknowledgedFormData(): FormData {
  const formData = new FormData();
  formData.set("smokeTestAcknowledged", "yes");
  return formData;
}

describe("sendResultsAnnouncementSmokeTestAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    sendResultsAnnouncementSmokeTest.mockResolvedValue({
      kind: "sent",
      message: "Smoke test email sent to the configured test recipient.",
    });
  });

  it("requires smoke test acknowledgement", async () => {
    await expect(sendResultsAnnouncementSmokeTestAction(new FormData())).resolves.toEqual({
      ok: false,
      message: "Confirm the smoke test send before continuing.",
    });
    expect(sendResultsAnnouncementSmokeTest).not.toHaveBeenCalled();
  });

  it("sends after acknowledgement without mutating announcement state in the action layer", async () => {
    await expect(sendResultsAnnouncementSmokeTestAction(acknowledgedFormData())).resolves.toEqual({
      ok: true,
      message: "Smoke test email sent to the configured test recipient.",
    });
    expect(sendResultsAnnouncementSmokeTest).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/teams");
  });

  it("returns provider failures from the smoke test service", async () => {
    sendResultsAnnouncementSmokeTest.mockResolvedValue({
      kind: "failed",
      message: "Invalid from address",
    });

    await expect(sendResultsAnnouncementSmokeTestAction(acknowledgedFormData())).resolves.toEqual({
      ok: false,
      message: "Invalid from address",
    });
  });
});
