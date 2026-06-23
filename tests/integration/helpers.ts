import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";


import { getDb } from "@/lib/db";
import { adminUsers, registrations, tournaments } from "@/lib/db/schema";

import type { AdminSession } from "@/lib/services/admin-auth";

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
