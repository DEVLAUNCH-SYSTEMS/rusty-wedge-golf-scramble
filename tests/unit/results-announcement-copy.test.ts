import { describe, expect, it } from "vitest";

import {
  buildSendResultsAnnouncementActionMessage,
  buildVerifyResultsAnnouncementActionMessage,
} from "@/lib/content/results-announcement-action-messages";
import { resultsAnnouncementAcknowledgementCopy } from "@/lib/content/results-announcement-copy";
import { resolveResultsAnnouncementPanelView } from "@/lib/content/results-announcement-panel-view";

describe("results announcement copy", () => {
  it("requires publish results before send UI is enabled", () => {
    const view = resolveResultsAnnouncementPanelView({
      resultsPublished: false,
      status: "not_sent",
      sentAt: null,
      recipientCount: 5,
      partialDelivery: null,
      emailConfigured: true,
    });

    expect(view.mode).toBe("readonly");
    expect(view.disabledMessage).toContain("Publish results");
  });

  it("exposes send mode for not_sent with recipients", () => {
    const view = resolveResultsAnnouncementPanelView({
      resultsPublished: true,
      status: "not_sent",
      sentAt: null,
      recipientCount: 4,
      partialDelivery: null,
      emailConfigured: true,
    });

    expect(view.mode).toBe("send");
    expect(view.formConfig?.submitLabel).toBe("Send results announcement");
  });

  it("exposes recovery mode for ambiguous and sending statuses", () => {
    for (const status of ["ambiguous", "sending"] as const) {
      const view = resolveResultsAnnouncementPanelView({
        resultsPublished: true,
        status,
        sentAt: null,
        recipientCount: 2,
        partialDelivery: null,
        emailConfigured: true,
      });

      expect(view.mode).toBe("recovery");
      expect(view.formConfig?.submitLabel).toBe("Verify send status");
    }
  });

  it("locks terminal sent and partial states", () => {
    const sentView = resolveResultsAnnouncementPanelView({
      resultsPublished: true,
      status: "sent",
      sentAt: new Date("2026-09-01T12:00:00Z"),
      recipientCount: 2,
      partialDelivery: null,
      emailConfigured: true,
    });

    expect(sentView.mode).toBe("readonly");
    expect(sentView.statusLabel).toBe("Sent");

    const partialView = resolveResultsAnnouncementPanelView({
      resultsPublished: true,
      status: "partial",
      sentAt: null,
      recipientCount: 2,
      partialDelivery: { successCount: 1, recipientCount: 2 },
      emailConfigured: true,
    });

    expect(partialView.mode).toBe("readonly");
    expect(partialView.statusDescription).toContain("1 of 2");
  });

  it("disables send when there are zero confirmed recipients", () => {
    const view = resolveResultsAnnouncementPanelView({
      resultsPublished: true,
      status: "not_sent",
      sentAt: null,
      recipientCount: 0,
      partialDelivery: null,
      emailConfigured: true,
    });

    expect(view.disabledMessage).toContain("No confirmed participants");
  });

  it("honors read-only tournament context", () => {
    const view = resolveResultsAnnouncementPanelView({
      resultsPublished: true,
      status: "not_sent",
      sentAt: null,
      recipientCount: 2,
      partialDelivery: null,
      emailConfigured: true,
      readOnlyReason: "Archived tournaments are read-only.",
    });

    expect(view.disabled).toBe(true);
    expect(view.disabledMessage).toBe("Archived tournaments are read-only.");
  });

  it("builds action success messages from send outcomes", () => {
    expect(
      buildSendResultsAnnouncementActionMessage({
        tournamentId: "tournament-1",
        status: "sent",
        recipientCount: 5,
        successCount: 5,
        failureCount: 0,
      }),
    ).toBe("Results announcement sent to 5 participants.");

    expect(
      buildVerifyResultsAnnouncementActionMessage({
        tournamentId: "tournament-1",
        status: "ambiguous",
        recipientCount: 5,
        successCount: 0,
        failureCount: 0,
      }),
    ).toContain("still uncertain");
  });

  it("uses fixed acknowledgement copy", () => {
    expect(resultsAnnouncementAcknowledgementCopy(1)).toContain(
      "cannot be undone",
    );
  });
});
