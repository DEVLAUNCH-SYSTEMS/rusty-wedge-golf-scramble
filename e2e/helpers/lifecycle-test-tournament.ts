import { config as loadDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

import * as schema from "../../lib/db/schema";
import { registrationEvents, tournaments } from "../../lib/db/schema";
import { registrationEnabledFromLifecycle } from "../../lib/services/tournament-lifecycle";

import type { TournamentLifecycleStatus } from "../../lib/services/tournament-lifecycle";

export const E2E_LIFECYCLE_TOURNAMENT_NAME = "E2E Lifecycle Tournament";

function ensureDatabaseEnv(): void {
  if (process.env.DATABASE_URL) {
    return;
  }

  loadDotenv({ path: ".env.local" });
  loadDotenv();
}

function lifecycleDb() {
  ensureDatabaseEnv();

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set for lifecycle E2E helpers.");
  }

  return drizzle(new Pool({ connectionString: url }), { schema });
}

export async function seedLifecycleE2ETournament(
  lifecycleStatus: Extract<TournamentLifecycleStatus, "completed" | "archived">,
) {
  const db = lifecycleDb();
  const year = 2100 + Math.floor(Math.random() * 50);
  const row = (
    await db
      .insert(tournaments)
      .values({
        name: E2E_LIFECYCLE_TOURNAMENT_NAME,
        slug: `e2e-lifecycle-${randomUUID()}`,
        year,
        eventDate: `${year}-06-01`,
        locationName: "E2E Course",
        venmoHandle: "@e2e",
        lifecycleStatus,
        isActive: false,
        registrationEnabled: registrationEnabledFromLifecycle(lifecycleStatus),
      })
      .returning()
  )[0];

  if (!row) {
    throw new Error("Unable to seed lifecycle E2E tournament.");
  }

  return row;
}

export async function deleteLifecycleE2ETournament(tournamentId: string) {
  const db = lifecycleDb();

  await db
    .delete(registrationEvents)
    .where(eq(registrationEvents.tournamentId, tournamentId));
  await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
}
