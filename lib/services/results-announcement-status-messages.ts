import { ServiceError } from "@/lib/services/service-error";

import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";

export function resultsAnnouncementStatusMessage(
  status: ResultsAnnouncementStatus,
): string {
  switch (status) {
    case "sent":
      return "Results announcement was already sent.";
    case "partial":
      return "Results announcement was partially sent. Do not send again.";
    case "sending":
      return "Results announcement send is already in progress.";
    case "ambiguous":
      return "Previous send outcome is uncertain. Use verify send status before retrying.";
    default:
      return "Results announcement cannot be sent in the current state.";
  }
}

export function throwResultsAnnouncementStatusError(
  status: ResultsAnnouncementStatus,
): never {
  throw new ServiceError(
    "RESULTS_ANNOUNCEMENT_STATUS",
    resultsAnnouncementStatusMessage(status),
  );
}
