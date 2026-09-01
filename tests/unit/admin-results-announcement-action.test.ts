import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendResultsAnnouncementAction,
  verifyResultsAnnouncementSendAction,
} from "@/lib/actions/admin-results-announcement";
import { AdminAuthError } from "@/lib/services/admin-auth";

const requireAdminSession = vi.fn();
const sendResultsAnnouncement = vi.fn();
const verifyResultsAnnouncementSend = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
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

vi.mock("@/lib/services/results-announcement-send", () => ({
  sendResultsAnnouncement: (...args: unknown[]) => sendResultsAnnouncement(...args),
  verifyResultsAnnouncementSend: (...args: unknown[]) =>
    verifyResultsAnnouncementSend(...args),
}));

function confirmedFormData(): FormData {
  const formData = new FormData();
  formData.set("confirmAcknowledged", "yes");
  return formData;
}

describe("results announcement actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSession.mockResolvedValue({
      adminUserId: "admin-1",
      neonAuthUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
    });
    sendResultsAnnouncement.mockResolvedValue({
      tournamentId: "tournament-1",
      status: "sent",
      recipientCount: 3,
      successCount: 3,
      failureCount: 0,
    });
    verifyResultsAnnouncementSend.mockResolvedValue({
      tournamentId: "tournament-1",
      status: "sent",
      recipientCount: 3,
      successCount: 3,
      failureCount: 0,
    });
  });

  it("requires send confirmation", async () => {
    await expect(sendResultsAnnouncementAction(new FormData())).resolves.toEqual({
      ok: false,
      message: "Confirm that you understand this one-time email before sending.",
    });
    expect(sendResultsAnnouncement).not.toHaveBeenCalled();
  });

  it("sends after confirmation and revalidates admin teams", async () => {
    await expect(sendResultsAnnouncementAction(confirmedFormData())).resolves.toEqual({
      ok: true,
      message: "Results announcement sent to 3 participants.",
    });
    expect(sendResultsAnnouncement).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/teams");
  });

  it("returns failure when send finalizes to not_sent", async () => {
    sendResultsAnnouncement.mockResolvedValue({
      tournamentId: "tournament-1",
      status: "not_sent",
      recipientCount: 3,
      successCount: 0,
      failureCount: 3,
    });

    await expect(sendResultsAnnouncementAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "Send failed. You can try again.",
    });
  });

  it("returns ambiguous guidance after an uncertain send", async () => {
    sendResultsAnnouncement.mockResolvedValue({
      tournamentId: "tournament-1",
      status: "ambiguous",
      recipientCount: 3,
      successCount: 0,
      failureCount: 0,
    });

    await expect(sendResultsAnnouncementAction(confirmedFormData())).resolves.toEqual({
      ok: true,
      message:
        "Send outcome uncertain. Use Verify send status — do not send again until verified.",
    });
  });

  it("verifies ambiguous sends without confirmation", async () => {
    await expect(verifyResultsAnnouncementSendAction(new FormData())).resolves.toEqual({
      ok: true,
      message: "Send verified. Results announcement sent to 3 participants.",
    });
    expect(verifyResultsAnnouncementSend).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/teams");
  });

  it("maps service errors to action failures", async () => {
    const { ServiceError } = await import("@/lib/services/service-error");
    sendResultsAnnouncement.mockRejectedValue(
      new ServiceError(
        "RESULTS_ANNOUNCEMENT_STATUS",
        "Results announcement was already sent.",
      ),
    );

    await expect(sendResultsAnnouncementAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "Results announcement was already sent.",
    });
  });

  it("rejects forbidden admin sessions", async () => {
    requireAdminSession.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "Admin access is not granted."),
    );

    await expect(sendResultsAnnouncementAction(confirmedFormData())).resolves.toEqual({
      ok: false,
      message: "Admin access is not granted.",
    });
  });
});
