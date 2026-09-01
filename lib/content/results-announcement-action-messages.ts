import type { SendResultsAnnouncementResult } from "@/lib/services/results-announcement-send";

export function buildSendResultsAnnouncementActionMessage(
  result: SendResultsAnnouncementResult,
): string {
  switch (result.status) {
    case "sent":
      return `Results announcement sent to ${result.recipientCount} participants.`;
    case "partial":
      return `${result.successCount} of ${result.recipientCount} sent. Do not use Send again — contact remaining participants manually.`;
    case "ambiguous":
      return "Send outcome uncertain. Use Verify send status — do not send again until verified.";
    case "not_sent":
      return "Send failed. You can try again.";
    default:
      return "Results announcement updated.";
  }
}

export function buildVerifyResultsAnnouncementActionMessage(
  result: SendResultsAnnouncementResult,
): string {
  if (result.status === "sent") {
    return `Send verified. Results announcement sent to ${result.recipientCount} participants.`;
  }

  if (result.status === "partial") {
    return `${result.successCount} of ${result.recipientCount} sent. Do not use Send again — contact remaining participants manually.`;
  }

  if (result.status === "ambiguous") {
    return "Send outcome is still uncertain. Try Verify send status again later.";
  }

  return buildSendResultsAnnouncementActionMessage(result);
}
