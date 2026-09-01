import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { tournaments } from "@/lib/db/schema";
import { throwResultsAnnouncementStatusError } from "@/lib/services/results-announcement-status-messages";
import { ServiceError } from "@/lib/services/service-error";

import type { ResultsAnnouncementStatus } from "@/lib/domain/results-announcement-batch-outcome";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type ClaimDb = NodePgDatabase<typeof schema>;
type ClaimTx = Parameters<Parameters<ClaimDb["transaction"]>[0]>[0];

export type ClaimResultsAnnouncementSendInput = {
  tournamentId: string;
  adminUserId: string;
};

async function readAnnouncementStatus(
  tx: ClaimTx,
  tournamentId: string,
): Promise<ResultsAnnouncementStatus | null> {
  const row = (
    await tx
      .select({ status: tournaments.resultsAnnouncementStatus })
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1)
  )[0];

  return row?.status ?? null;
}

async function claimNotSentStatus(
  tx: ClaimTx,
  input: ClaimResultsAnnouncementSendInput,
): Promise<boolean> {
  const rows = await tx
    .update(tournaments)
    .set({
      resultsAnnouncementStatus: "sending",
      resultsAnnouncementSentByAdminId: input.adminUserId,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(tournaments.id, input.tournamentId),
        eq(tournaments.resultsPublished, true),
        eq(tournaments.resultsAnnouncementStatus, "not_sent"),
      ),
    )
    .returning({ id: tournaments.id });

  return rows.length > 0;
}

async function rejectFailedClaim(
  tx: ClaimTx,
  tournamentId: string,
): Promise<never> {
  const status = await readAnnouncementStatus(tx, tournamentId);

  if (!status) {
    throw new ServiceError("TOURNAMENT_NOT_FOUND", "Tournament not found.");
  }

  throwResultsAnnouncementStatusError(status);
}

export async function claimResultsAnnouncementSend(
  input: ClaimResultsAnnouncementSendInput,
): Promise<void> {
  const db = drizzle(getPgPool(), { schema });

  await db.transaction(async (tx) => {
    const claimed = await claimNotSentStatus(tx, input);

    if (!claimed) {
      await rejectFailedClaim(tx, input.tournamentId);
    }
  });
}
