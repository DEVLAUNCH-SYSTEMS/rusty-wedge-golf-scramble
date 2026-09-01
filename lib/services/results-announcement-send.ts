import { sendResultsAnnouncementBatch } from "@/lib/email/results-announcement-batch";
import { buildResultsAnnouncementIdempotencyKey } from "@/lib/email/results-announcement-idempotency";
import { resolveAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { claimResultsAnnouncementSend } from "@/lib/services/results-announcement-claim";
import { finalizeResultsAnnouncementSend } from "@/lib/services/results-announcement-finalize";
import { loadResultsAnnouncementRecipientSummary } from "@/lib/services/results-announcement-recipients";
import {
  assertResultsAnnouncementRecipients,
  assertResultsAnnouncementSendAllowed,
} from "@/lib/services/results-announcement-send-guards";

import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";
import type { AdminSession } from "@/lib/services/admin-auth";

export type SendResultsAnnouncementResult = {
  tournamentId: string;
  status: ResultsAnnouncementStatus;
  recipientCount: number;
  successCount: number;
  failureCount: number;
};

export async function sendResultsAnnouncement(
  admin: AdminSession,
): Promise<SendResultsAnnouncementResult> {
  const context = await resolveAdminTournamentContext();
  assertResultsAnnouncementSendAllowed(context);

  const { recipients, recipientCount } = await loadResultsAnnouncementRecipientSummary(
    context.tournament.id,
  );
  assertResultsAnnouncementRecipients(recipientCount);

  await claimResultsAnnouncementSend({
    tournamentId: context.tournament.id,
    adminUserId: admin.adminUserId,
  });

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

export { verifyResultsAnnouncementSend } from "@/lib/services/results-announcement-recovery";
