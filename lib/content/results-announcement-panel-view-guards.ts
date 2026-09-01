import type {
  ResultsAnnouncementPanelInput,
  ResultsAnnouncementPanelView,
} from "@/lib/content/results-announcement-panel-view-types";
import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";
import type { ResultsAnnouncementPartialDelivery } from "@/lib/services/results-announcement-admin-view";

function formatSentAtLabel(sentAt: Date): string {
  return sentAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildPartialDescription(
  partialDelivery: ResultsAnnouncementPartialDelivery | null,
): string {
  if (!partialDelivery) {
    return "Partially sent. Remaining recipients were not emailed. Do not send again.";
  }

  return `Partially sent — ${partialDelivery.successCount} of ${partialDelivery.recipientCount} delivered. Contact remaining participants manually.`;
}

function resolveSentStatus(sentAt: Date | null) {
  return {
    statusLabel: "Sent",
    statusTone: "success" as const,
    statusDescription: sentAt
      ? `Sent on ${formatSentAtLabel(sentAt)}.`
      : "Results announcement sent.",
  };
}

function resolvePartialStatus(
  partialDelivery: ResultsAnnouncementPartialDelivery | null,
) {
  return {
    statusLabel: "Partially sent",
    statusTone: "warning" as const,
    statusDescription: buildPartialDescription(partialDelivery),
  };
}

export function resolveReadonlyStatus(input: {
  status: ResultsAnnouncementStatus;
  sentAt: Date | null;
  partialDelivery: ResultsAnnouncementPartialDelivery | null;
}) {
  if (input.status === "sent") {
    return resolveSentStatus(input.sentAt);
  }

  if (input.status === "partial") {
    return resolvePartialStatus(input.partialDelivery);
  }

  return {
    statusLabel: "Not sent",
    statusTone: "neutral" as const,
    statusDescription: "Results announcement has not been sent.",
  };
}

export function buildUnavailablePanelView(input: {
  recipientCount: number;
  disabledMessage: string;
  statusLabel: string;
  statusTone: ResultsAnnouncementPanelView["statusTone"];
  statusDescription: string;
}): ResultsAnnouncementPanelView {
  return {
    mode: "readonly",
    disabled: true,
    disabledMessage: input.disabledMessage,
    statusLabel: input.statusLabel,
    statusTone: input.statusTone,
    statusDescription: input.statusDescription,
    recipientCount: input.recipientCount,
  };
}

function buildResultsHiddenView(recipientCount: number): ResultsAnnouncementPanelView {
  return buildUnavailablePanelView({
    recipientCount,
    disabledMessage: "Publish results before sending the results announcement.",
    statusLabel: "Unavailable",
    statusTone: "neutral",
    statusDescription: "Publish results before sending the results announcement.",
  });
}

function buildEmailNotConfiguredView(recipientCount: number): ResultsAnnouncementPanelView {
  return buildUnavailablePanelView({
    recipientCount,
    disabledMessage:
      "Email sending is not configured. Set RESEND_API_KEY, RESEND_FROM, and APP_BASE_URL.",
    statusLabel: "Not configured",
    statusTone: "warning",
    statusDescription: "Email sending environment variables are missing.",
  });
}

function buildZeroRecipientsView(recipientCount: number): ResultsAnnouncementPanelView {
  return buildUnavailablePanelView({
    recipientCount,
    disabledMessage: "No confirmed participants to email.",
    statusLabel: "No recipients",
    statusTone: "neutral",
    statusDescription: "No confirmed participants to email.",
  });
}

export function resolveBlockedPanelView(
  input: ResultsAnnouncementPanelInput,
): ResultsAnnouncementPanelView | null {
  if (!input.resultsPublished) {
    return buildResultsHiddenView(input.recipientCount);
  }

  if (input.readOnlyReason) {
    return buildUnavailablePanelView({
      recipientCount: input.recipientCount,
      disabledMessage: input.readOnlyReason,
      ...resolveReadonlyStatus(input),
    });
  }

  if (!input.emailConfigured) {
    return buildEmailNotConfiguredView(input.recipientCount);
  }

  if (input.recipientCount === 0) {
    return buildZeroRecipientsView(input.recipientCount);
  }

  return null;
}

export function buildTerminalReadonlyView(
  input: Pick<ResultsAnnouncementPanelInput, "recipientCount" | "status" | "sentAt" | "partialDelivery">,
): ResultsAnnouncementPanelView {
  return {
    mode: "readonly",
    disabled: true,
    recipientCount: input.recipientCount,
    ...resolveReadonlyStatus(input),
  };
}
