import { isResendConfigured } from "@/lib/email/resend-env";
import { ServiceError } from "@/lib/services/service-error";
import { assertTournamentWritable } from "@/lib/services/tournament";

import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";
import type { AdminTournamentContext } from "@/lib/services/admin-tournament-context";

export function assertResultsAnnouncementSendAllowed(
  context: AdminTournamentContext,
): void {
  assertTournamentWritable(context.tournament);

  if (!context.isViewingActiveTournament) {
    throw new ServiceError(
      "TOURNAMENT_NOT_ACTIVE",
      "Switch to the active tournament before sending the results announcement.",
    );
  }

  if (!context.tournament.resultsPublished) {
    throw new ServiceError(
      "RESULTS_NOT_PUBLISHED",
      "Publish results before sending the results announcement.",
    );
  }

  if (!isResendConfigured()) {
    throw new ServiceError(
      "EMAIL_CONFIG",
      "Email sending is not configured. Set RESEND_API_KEY, RESEND_FROM, and APP_BASE_URL.",
    );
  }
}

export function assertResultsAnnouncementRecoveryAllowed(
  context: AdminTournamentContext,
  status: ResultsAnnouncementStatus,
): void {
  assertResultsAnnouncementSendAllowed(context);

  if (status !== "ambiguous" && status !== "sending") {
    throw new ServiceError(
      "RESULTS_ANNOUNCEMENT_STATUS",
      "Only ambiguous or in-progress sends can be verified.",
    );
  }
}

export function assertResultsAnnouncementRecipients(
  recipientCount: number,
): void {
  if (recipientCount === 0) {
    throw new ServiceError(
      "RESULTS_ANNOUNCEMENT_NO_RECIPIENTS",
      "No confirmed participants to email.",
    );
  }
}
