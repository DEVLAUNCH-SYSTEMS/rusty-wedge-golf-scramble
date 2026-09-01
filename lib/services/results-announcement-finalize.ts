import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";

import type {
  ResultsAnnouncementBatchOutcome,
  ResultsAnnouncementStatus,
} from "@/lib/domain/results-announcement-batch-outcome";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type FinalizeDb = NodePgDatabase<typeof schema>;
type FinalizeTx = Parameters<Parameters<FinalizeDb["transaction"]>[0]>[0];

export type FinalizeResultsAnnouncementSendInput = {
  tournamentId: string;
  adminUserId: string;
  idempotencyKey: string;
  recipientCount: number;
  outcome: ResultsAnnouncementBatchOutcome;
};

export type FinalizeResultsAnnouncementSendResult = {
  status: ResultsAnnouncementStatus;
  recipientCount: number;
  successCount: number;
  failureCount: number;
};

type FinalizePlan = {
  status: ResultsAnnouncementStatus;
  sentAt: Date | null;
  auditEventType: (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];
  metadata: Record<string, unknown>;
  recipientCount: number;
  successCount: number;
  failureCount: number;
};

function buildSuccessPlan(
  input: FinalizeResultsAnnouncementSendInput,
  outcome: Extract<ResultsAnnouncementBatchOutcome, { kind: "full_success" }>,
): FinalizePlan {
  return {
    status: "sent",
    sentAt: new Date(),
    auditEventType: AUDIT_EVENT_TYPES.resultsAnnouncementSent,
    metadata: {
      idempotencyKey: input.idempotencyKey,
      recipientCount: outcome.recipientCount,
      successCount: outcome.successCount,
      failureCount: 0,
      providerBatchIds: outcome.providerBatchIds,
    },
    recipientCount: outcome.recipientCount,
    successCount: outcome.successCount,
    failureCount: 0,
  };
}

function buildPartialPlan(
  input: FinalizeResultsAnnouncementSendInput,
  outcome: Extract<ResultsAnnouncementBatchOutcome, { kind: "partial" }>,
): FinalizePlan {
  return {
    status: "partial",
    sentAt: null,
    auditEventType: AUDIT_EVENT_TYPES.resultsAnnouncementPartial,
    metadata: {
      idempotencyKey: input.idempotencyKey,
      recipientCount: outcome.recipientCount,
      successCount: outcome.successCount,
      failureCount: outcome.failureCount,
      providerBatchIds: outcome.providerBatchIds,
    },
    recipientCount: outcome.recipientCount,
    successCount: outcome.successCount,
    failureCount: outcome.failureCount,
  };
}

function buildKnownFailurePlan(
  input: FinalizeResultsAnnouncementSendInput,
  outcome: Extract<ResultsAnnouncementBatchOutcome, { kind: "known_failure" }>,
): FinalizePlan {
  return {
    status: "not_sent",
    sentAt: null,
    auditEventType: AUDIT_EVENT_TYPES.resultsAnnouncementFailed,
    metadata: {
      idempotencyKey: input.idempotencyKey,
      recipientCount: input.recipientCount,
      message: outcome.message,
    },
    recipientCount: input.recipientCount,
    successCount: 0,
    failureCount: input.recipientCount,
  };
}

function buildAmbiguousPlan(
  input: FinalizeResultsAnnouncementSendInput,
  outcome: Extract<ResultsAnnouncementBatchOutcome, { kind: "ambiguous" }>,
): FinalizePlan {
  return {
    status: "ambiguous",
    sentAt: null,
    auditEventType: AUDIT_EVENT_TYPES.resultsAnnouncementAmbiguous,
    metadata: {
      idempotencyKey: input.idempotencyKey,
      recipientCount: input.recipientCount,
      message: outcome.message,
    },
    recipientCount: input.recipientCount,
    successCount: 0,
    failureCount: 0,
  };
}

function buildFinalizePlan(input: FinalizeResultsAnnouncementSendInput): FinalizePlan {
  switch (input.outcome.kind) {
    case "full_success":
      return buildSuccessPlan(input, input.outcome);
    case "partial":
      return buildPartialPlan(input, input.outcome);
    case "known_failure":
      return buildKnownFailurePlan(input, input.outcome);
    case "ambiguous":
      return buildAmbiguousPlan(input, input.outcome);
  }
}

async function persistFinalizePlan(
  tx: FinalizeTx,
  input: FinalizeResultsAnnouncementSendInput,
  plan: FinalizePlan,
): Promise<void> {
  await tx
    .update(tournaments)
    .set({
      resultsAnnouncementStatus: plan.status,
      resultsAnnouncementSentAt: plan.sentAt,
      resultsAnnouncementSentByAdminId: input.adminUserId,
      updatedAt: sql`now()`,
    })
    .where(eq(tournaments.id, input.tournamentId));

  await tx.insert(registrationEvents).values({
    tournamentId: input.tournamentId,
    adminUserId: input.adminUserId,
    eventType: plan.auditEventType,
    metadata: plan.metadata,
  });
}

export async function finalizeResultsAnnouncementSend(
  input: FinalizeResultsAnnouncementSendInput,
): Promise<FinalizeResultsAnnouncementSendResult> {
  const plan = buildFinalizePlan(input);
  const db = drizzle(getPgPool(), { schema });

  await db.transaction(async (tx) => {
    await persistFinalizePlan(tx, input, plan);
  });

  return {
    status: plan.status,
    recipientCount: plan.recipientCount,
    successCount: plan.successCount,
    failureCount: plan.failureCount,
  };
}
