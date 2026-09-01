import { buildPublicResultsAbsoluteUrl } from "@/lib/email/app-base-url";
import { getResendClient } from "@/lib/email/resend-client";
import { getResendEnvConfig } from "@/lib/email/resend-env";
import {
  classifyBatchTransportError,
  classifyPermissiveBatchResponse,
} from "@/lib/email/results-announcement-batch-classify";
import { buildResultsAnnouncementEmailContent } from "@/lib/email/results-announcement-template";

import type { ResultsAnnouncementBatchOutcome } from "@/lib/domain/results-announcement-batch-outcome";
import type { ResultsAnnouncementRecipient } from "@/lib/services/results-announcement-recipients";

export type SendResultsAnnouncementBatchInput = {
  idempotencyKey: string;
  tournamentName: string;
  tournamentYear: number;
  recipients: ResultsAnnouncementRecipient[];
};

function buildBatchPayload(
  input: SendResultsAnnouncementBatchInput,
  from: string,
  resultsUrl: string,
) {
  return input.recipients.map((recipient) => {
    const content = buildResultsAnnouncementEmailContent({
      tournamentName: input.tournamentName,
      tournamentYear: input.tournamentYear,
      recipientFirstName: recipient.firstName,
      resultsUrl,
    });

    return {
      from,
      to: recipient.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    };
  });
}

export async function sendResultsAnnouncementBatch(
  input: SendResultsAnnouncementBatchInput,
): Promise<ResultsAnnouncementBatchOutcome> {
  const config = getResendEnvConfig();
  const resultsUrl = buildPublicResultsAbsoluteUrl(config.appBaseUrl);
  const payload = buildBatchPayload(input, config.from, resultsUrl);

  try {
    const response = await getResendClient().batch.send(payload, {
      idempotencyKey: input.idempotencyKey,
      batchValidation: "permissive",
    });

    return classifyPermissiveBatchResponse({
      recipientCount: input.recipients.length,
      response,
    });
  } catch (error) {
    return classifyBatchTransportError(error);
  }
}
