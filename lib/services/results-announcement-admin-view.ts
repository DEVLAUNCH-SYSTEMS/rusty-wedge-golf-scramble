import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrationEvents } from "@/lib/db/schema";
import { isResendConfigured } from "@/lib/email/resend-env";
import { isResultsAnnouncementSmokeTestEnabled } from "@/lib/email/results-announcement-smoke-env";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { loadResultsAnnouncementRecipientSummary } from "@/lib/services/results-announcement-recipients";
import { requireTournamentById } from "@/lib/services/tournament";

import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";

export type ResultsAnnouncementPartialDelivery = {
  successCount: number;
  recipientCount: number;
};

export type ResultsAnnouncementAdminView = {
  status: ResultsAnnouncementStatus;
  sentAt: Date | null;
  recipientCount: number;
  partialDelivery: ResultsAnnouncementPartialDelivery | null;
  emailConfigured: boolean;
  smokeTestEnabled: boolean;
};

function readPartialDeliveryMetadata(
  metadata: unknown,
): ResultsAnnouncementPartialDelivery | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const record = metadata as Record<string, unknown>;
  const successCount = record.successCount;
  const recipientCount = record.recipientCount;

  if (typeof successCount !== "number" || typeof recipientCount !== "number") {
    return null;
  }

  return { successCount, recipientCount };
}

async function loadLatestPartialDelivery(
  tournamentId: string,
): Promise<ResultsAnnouncementPartialDelivery | null> {
  const db = getDb();
  const row = (
    await db
      .select({ metadata: registrationEvents.metadata })
      .from(registrationEvents)
      .where(
        and(
          eq(registrationEvents.tournamentId, tournamentId),
          eq(registrationEvents.eventType, AUDIT_EVENT_TYPES.resultsAnnouncementPartial),
        ),
      )
      .orderBy(desc(registrationEvents.createdAt))
      .limit(1)
  )[0];

  return readPartialDeliveryMetadata(row?.metadata);
}

export async function loadResultsAnnouncementAdminView(
  tournamentId: string,
): Promise<ResultsAnnouncementAdminView> {
  const tournament = await requireTournamentById(tournamentId);
  const { recipientCount } = await loadResultsAnnouncementRecipientSummary(tournamentId);
  const partialDelivery =
    tournament.resultsAnnouncementStatus === "partial"
      ? await loadLatestPartialDelivery(tournamentId)
      : null;

  return {
    status: tournament.resultsAnnouncementStatus,
    sentAt: tournament.resultsAnnouncementSentAt,
    recipientCount,
    partialDelivery,
    emailConfigured: isResendConfigured(),
    smokeTestEnabled: isResultsAnnouncementSmokeTestEnabled(),
  };
}
