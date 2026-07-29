import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPgPool } from "@/lib/db/pg-pool";
import * as schema from "@/lib/db/schema";
import { registrationEvents, tournaments } from "@/lib/db/schema";

export async function deleteLifecycleTestTournament(
  tournamentId: string,
): Promise<void> {
  const db = drizzle(getPgPool(), { schema });

  await db
    .delete(registrationEvents)
    .where(eq(registrationEvents.tournamentId, tournamentId));
  await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
}
