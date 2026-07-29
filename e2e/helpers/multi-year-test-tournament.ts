import { config as loadDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

import * as schema from "../../lib/db/schema";
import { registrationEvents, registrations, tournaments } from "../../lib/db/schema";

export const E2E_MULTI_YEAR_TOURNAMENT_NAME = "E2E Multi-Year Isolation";
export const E2E_MULTI_YEAR_PLAYER_LAST_NAME = "MultiYearIsolate";

export type MultiYearE2EFixture = {
  activeTournamentId: string;
  activeTournamentName: string;
  draftTournamentId: string;
  draftYear: number;
  draftEmail: string;
};

function ensureDatabaseEnv(): void {
  if (process.env.DATABASE_URL) {
    return;
  }

  loadDotenv({ path: ".env.local" });
  loadDotenv();
}

function multiYearDb() {
  ensureDatabaseEnv();

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set for multi-year E2E helpers.");
  }

  return drizzle(new Pool({ connectionString: url }), { schema });
}

export async function seedMultiYearE2EFixture(): Promise<MultiYearE2EFixture> {
  const db = multiYearDb();
  const active = (
    await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
      })
      .from(tournaments)
      .where(eq(tournaments.isActive, true))
      .limit(1)
  )[0];

  if (!active) {
    throw new Error("No active tournament found for multi-year E2E.");
  }

  const draftYear = 2100 + Math.floor(Math.random() * 50);
  const draft = (
    await db
      .insert(tournaments)
      .values({
        name: E2E_MULTI_YEAR_TOURNAMENT_NAME,
        slug: `e2e-multi-year-${randomUUID()}`,
        year: draftYear,
        eventDate: `${draftYear}-06-01`,
        locationName: "E2E Course",
        venmoHandle: "@e2emultiyear",
        lifecycleStatus: "draft",
        isActive: false,
        registrationEnabled: false,
        entryFeeCents: 9900,
        confirmedCapacityLimit: 68,
      })
      .returning({ id: tournaments.id })
  )[0];

  if (!draft) {
    throw new Error("Unable to seed multi-year E2E draft tournament.");
  }

  const draftEmail = `e2e-multiyear-${randomUUID()}@example.com`;

  await db.insert(registrations).values({
    tournamentId: draft.id,
    firstName: "E2E",
    lastName: E2E_MULTI_YEAR_PLAYER_LAST_NAME,
    email: draftEmail,
    phone: "5095550100",
    skillLevel: "B",
    registrationStatus: "pending_review",
    paymentStatus: "submitted",
    paymentProofPath: `payment-proofs/${draft.id}/${randomUUID()}.png`,
  });

  return {
    activeTournamentId: active.id,
    activeTournamentName: active.name,
    draftTournamentId: draft.id,
    draftYear,
    draftEmail,
  };
}

export async function deleteMultiYearE2EFixture(draftTournamentId: string): Promise<void> {
  const db = multiYearDb();

  await db.delete(registrations).where(eq(registrations.tournamentId, draftTournamentId));
  await db
    .delete(registrationEvents)
    .where(eq(registrationEvents.tournamentId, draftTournamentId));
  await db.delete(tournaments).where(eq(tournaments.id, draftTournamentId));
}
