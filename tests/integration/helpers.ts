import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";


import { getDb } from "@/lib/db";
import { adminUsers, registrations, tournaments } from "@/lib/db/schema";

import type { AdminSession } from "@/lib/services/admin-auth";

const TEST_YEAR_MIN = 2080;
const TEST_YEAR_MAX = 2099;

async function isYearAvailable(year: number): Promise<boolean> {
  const db = getDb();
  const row = (
    await db
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.year, year))
      .limit(1)
  )[0];

  return !row;
}

export async function reserveUniqueTestYear(): Promise<number> {
  const yearCount = TEST_YEAR_MAX - TEST_YEAR_MIN + 1;
  const start = Math.floor(Math.random() * yearCount);

  for (let offset = 0; offset < yearCount; offset++) {
    const year = TEST_YEAR_MIN + ((start + offset) % yearCount);

    if (await isYearAvailable(year)) {
      return year;
    }
  }

  throw new Error(
    `No unused tournament year available between ${TEST_YEAR_MIN} and ${TEST_YEAR_MAX}.`,
  );
}

export async function reserveUniqueTestYearPair(): Promise<[number, number]> {
  for (let first = TEST_YEAR_MIN; first < TEST_YEAR_MAX; first++) {
    if ((await isYearAvailable(first)) && (await isYearAvailable(first + 1))) {
      return [first, first + 1];
    }
  }

  throw new Error(
    `No consecutive unused tournament years available between ${TEST_YEAR_MIN} and ${TEST_YEAR_MAX}.`,
  );
}

export function uniqueTestEmail(label: string): string {
  return `${label}-${randomUUID()}@example.com`;
}

export async function getActiveTournamentId(): Promise<string> {
  const db = getDb();
  const row = (
    await db
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.isActive, true))
      .limit(1)
  )[0];

  if (!row) {
    throw new Error("Active tournament not found. Run npm run db:seed on the CI branch.");
  }

  return row.id;
}

export async function insertRegistrationRow(input: {
  tournamentId: string;
  email: string;
  registrationStatus: "pending_review" | "confirmed" | "cancelled";
  paymentStatus?: "submitted" | "not_submitted";
}) {
  const db = getDb();

  return db
    .insert(registrations)
    .values({
      tournamentId: input.tournamentId,
      firstName: "Test",
      lastName: "Player",
      email: input.email,
      phone: "5095550100",
      skillLevel: "B",
      registrationStatus: input.registrationStatus,
      paymentStatus: input.paymentStatus ?? "submitted",
      paymentProofPath:
        input.registrationStatus === "pending_review"
          ? `payment-proofs/${input.tournamentId}/${randomUUID()}.png`
          : null,
    })
    .returning({ id: registrations.id })
    .then((rows) => rows[0]);
}

export async function createTestAdminSession(): Promise<AdminSession> {
  const db = getDb();
  const neonAuthUserId = `test-admin-${randomUUID()}`;
  const email = uniqueTestEmail("admin");

  const admin = (
    await db
      .insert(adminUsers)
      .values({
        neonAuthUserId,
        email,
        displayName: "Integration Admin",
      })
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        displayName: adminUsers.displayName,
      })
  )[0];

  if (!admin) {
    throw new Error("Unable to create test admin user.");
  }

  return {
    neonAuthUserId,
    adminUserId: admin.id,
    email: admin.email,
    displayName: admin.displayName,
  };
}
