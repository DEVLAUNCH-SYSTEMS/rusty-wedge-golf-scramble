import { sendResultsAnnouncementBatch } from "@/lib/email/results-announcement-batch";
import { buildResultsAnnouncementIdempotencyKey } from "@/lib/email/results-announcement-idempotency";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { finalizeResultsAnnouncementSend } from "@/lib/services/results-announcement-finalize";
import { loadResultsAnnouncementRecipientSummary } from "@/lib/services/results-announcement-recipients";
import {
  assertResultsAnnouncementRecipients,
  assertResultsAnnouncementRecoveryAllowed,
  assertResultsAnnouncementSendAllowed,
} from "@/lib/services/results-announcement-send-guards";

import type { AdminSession } from "@/lib/services/admin-auth";
import type { SendResultsAnnouncementResult } from "@/lib/services/results-announcement-send";

export async function verifyResultsAnnouncementSend(
  admin: AdminSession,
): Promise<SendResultsAnnouncementResult> {
  const context = await resolveAdminTournamentContext();
  assertResultsAnnouncementRecoveryAllowed(
    context,
    context.tournament.resultsAnnouncementStatus,
  );
  assertResultsAnnouncementSendAllowed(context);

  const { recipients, recipientCount } = await loadResultsAnnouncementRecipientSummary(
    context.tournament.id,
  );
  assertResultsAnnouncementRecipients(recipientCount);

  const idempotencyKey = buildResultsAnnouncementIdempotencyKey(context.tournament.id);
  const outcome = await sendResultsAnnouncementBatch({
    idempotencyKey,
    tournamentName: context.tournament.name,
    tournamentYear: context.tournament.year,
    recipients,
  });

  const finalized = await finalizeResultsAnnouncementSend({
    tournamentId: context.tournament.id,
    adminUserId: admin.adminUserId,
    idempotencyKey,
    recipientCount,
    outcome,
  });

  return {
    tournamentId: context.tournament.id,
    status: finalized.status,
    recipientCount,
    successCount: finalized.successCount,
    failureCount: finalized.failureCount,
  };
}
