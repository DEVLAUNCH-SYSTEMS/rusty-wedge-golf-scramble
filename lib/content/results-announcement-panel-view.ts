import { resultsAnnouncementRecipientDescription } from "@/lib/content/results-announcement-copy";
import {
  buildTerminalReadonlyView,
  resolveBlockedPanelView,
} from "@/lib/content/results-announcement-panel-view-guards";

import type {
  ResultsAnnouncementPanelInput,
  ResultsAnnouncementPanelView,
} from "@/lib/content/results-announcement-panel-view-types";

export type {
  ResultsAnnouncementFormConfig,
  ResultsAnnouncementPanelInput,
  ResultsAnnouncementPanelMode,
  ResultsAnnouncementPanelView,
} from "@/lib/content/results-announcement-panel-view-types";

export function buildSendPanelView(recipientCount: number): ResultsAnnouncementPanelView {
  return {
    mode: "send",
    disabled: false,
    recipientCount,
    statusLabel: "Not sent",
    statusTone: "neutral",
    statusDescription: resultsAnnouncementRecipientDescription(recipientCount),
    formConfig: {
      submitLabel: "Send results announcement",
      pendingLabel: "Sending…",
    },
  };
}

function buildAmbiguousRecoveryView(recipientCount: number): ResultsAnnouncementPanelView {
  return {
    mode: "recovery",
    disabled: false,
    recipientCount,
    statusLabel: "Outcome uncertain",
    statusTone: "warning",
    statusDescription:
      "Send outcome uncertain. Use Verify send status — do not send again until verified.",
    formConfig: {
      submitLabel: "Verify send status",
      pendingLabel: "Verifying…",
    },
  };
}

function buildSendingRecoveryView(recipientCount: number): ResultsAnnouncementPanelView {
  return {
    mode: "recovery",
    disabled: false,
    recipientCount,
    statusLabel: "Send in progress",
    statusTone: "info",
    statusDescription:
      "Send may have been interrupted. Use Verify send status to finalize the outcome.",
    formConfig: {
      submitLabel: "Verify send status",
      pendingLabel: "Verifying…",
    },
  };
}

export function buildRecoveryPanelView(
  recipientCount: number,
  status: "ambiguous" | "sending",
): ResultsAnnouncementPanelView {
  return status === "ambiguous"
    ? buildAmbiguousRecoveryView(recipientCount)
    : buildSendingRecoveryView(recipientCount);
}

export function resolveResultsAnnouncementPanelView(
  input: ResultsAnnouncementPanelInput,
): ResultsAnnouncementPanelView {
  const blocked = resolveBlockedPanelView(input);

  if (blocked) {
    return blocked;
  }

  if (input.status === "sent" || input.status === "partial") {
    return buildTerminalReadonlyView(input);
  }

  if (input.status === "ambiguous" || input.status === "sending") {
    return buildRecoveryPanelView(input.recipientCount, input.status);
  }

  return buildSendPanelView(input.recipientCount);
}
