import { sendResultsAnnouncementBatch } from "@/lib/email/results-announcement-batch";
import { buildResultsAnnouncementSmokeTestIdempotencyKey } from "@/lib/email/results-announcement-idempotency";
import {
  assertResultsAnnouncementSmokeTestAllowed,
  readResultsAnnouncementSmokeIdempotencySuffix,
  readResultsAnnouncementSmokeRecipient,
} from "@/lib/email/results-announcement-smoke-env";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { ServiceError } from "@/lib/services/service-error";

import type { ResultsAnnouncementBatchOutcome } from "@/lib/domain/results-announcement-batch-outcome";
import type { AdminSession } from "@/lib/services/admin-auth";

export type ResultsAnnouncementSmokeTestResult = {
  kind: "sent" | "failed";
  message: string;
};

function buildSmokeTestRecipient(email: string) {
  return {
    registrationId: "smoke-test",
    email,
    firstName: "Smoke",
    lastName: "Test",
  };
}

function mapSmokeTestOutcome(
  outcome: ResultsAnnouncementBatchOutcome,
): ResultsAnnouncementSmokeTestResult {
  if (outcome.kind === "full_success") {
    return {
      kind: "sent",
      message: "Smoke test email sent to the configured test recipient.",
    };
  }

  if (outcome.kind === "partial") {
    return {
      kind: "failed",
      message: "Smoke test send partially failed. Check Resend logs for details.",
    };
  }

  if (outcome.kind === "known_failure") {
    return {
      kind: "failed",
      message: outcome.message,
    };
  }

  return {
    kind: "failed",
    message: outcome.message,
  };
}

function assertResultsPublishedForSmokeTest(resultsPublished: boolean): void {
  if (!resultsPublished) {
    throw new ServiceError(
      "RESULTS_NOT_PUBLISHED",
      "Publish results before sending a smoke test announcement email.",
    );
  }
}

export async function sendResultsAnnouncementSmokeTest(
  _admin: AdminSession,
): Promise<ResultsAnnouncementSmokeTestResult> {
  assertResultsAnnouncementSmokeTestAllowed();

  const context = await resolveAdminTournamentContext();
  assertResultsPublishedForSmokeTest(context.tournament.resultsPublished);

  const smokeRecipient = readResultsAnnouncementSmokeRecipient();
  const runSuffix = readResultsAnnouncementSmokeIdempotencySuffix();
  const idempotencyKey = buildResultsAnnouncementSmokeTestIdempotencyKey(
    context.tournament.id,
    runSuffix,
  );

  const outcome = await sendResultsAnnouncementBatch({
    idempotencyKey,
    tournamentName: context.tournament.name,
    tournamentYear: context.tournament.year,
    recipients: [buildSmokeTestRecipient(smokeRecipient)],
  });

  return mapSmokeTestOutcome(outcome);
}
