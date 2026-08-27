import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, teams } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type TeamDeleteTransactionInput = {
  teamId: string;
  tournamentId: string;
  adminUserId: string;
  memberCount: number;
  teamName: string;
  teamNumber: number | null;
};

type TeamDeleteDb = NodePgDatabase<typeof schema>;
type TeamDeleteTx = Parameters<Parameters<TeamDeleteDb["transaction"]>[0]>[0];

async function clearTeamAuditReferences(
  tx: TeamDeleteTx,
  teamId: string,
): Promise<void> {
  await tx
    .update(registrationEvents)
    .set({ teamId: null })
    .where(eq(registrationEvents.teamId, teamId));
}

export async function executeTeamDeleteTransaction(
  input: TeamDeleteTransactionInput,
): Promise<void> {
  const db = drizzle(getPgPool(), { schema });

  await db.transaction(async (tx) => {
    await clearTeamAuditReferences(tx, input.teamId);

    await tx.insert(registrationEvents).values({
      tournamentId: input.tournamentId,
      eventType: AUDIT_EVENT_TYPES.teamDeleted,
      adminUserId: input.adminUserId,
      metadata: {
        teamNumber: input.teamNumber,
        memberCount: input.memberCount,
        teamName: input.teamName,
      },
    });

    await tx.delete(teams).where(eq(teams.id, input.teamId));
  });
}
