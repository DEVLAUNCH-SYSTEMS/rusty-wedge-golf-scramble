import { and, count, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, waitlistEntries } from "@/lib/db/schema";
import { getTeamAssignmentReport } from "@/lib/services/team-assignment-report";
import { requireActiveTournament } from "@/lib/services/tournament";

export type AdminDashboardSummary = {
  tournamentName: string;
  capacityLimit: number;
  confirmedCount: number;
  pendingReviewCount: number;
  waitlistCount: number;
  paymentRejectedCount: number;
  assignment: {
    confirmedCount: number;
    assignedCount: number;
    unassignedCount: number;
  };
};

async function countByRegistrationStatus(
  tournamentId: string,
  registrationStatus: "pending_review",
): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, registrationStatus),
      ),
    );

  return Number(rows[0]?.total ?? 0);
}

async function countByPaymentStatus(
  tournamentId: string,
  paymentStatus: "rejected",
): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.paymentStatus, paymentStatus),
      ),
    );

  return Number(rows[0]?.total ?? 0);
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const tournament = await requireActiveTournament();
  const db = getDb();

  const waitlistRows = await db
    .select({ total: count() })
    .from(waitlistEntries)
    .where(
      and(
        eq(waitlistEntries.tournamentId, tournament.id),
        eq(waitlistEntries.status, "active"),
      ),
    );

  const assignment = await getTeamAssignmentReport(tournament.id);

  return {
    tournamentName: tournament.name,
    capacityLimit: tournament.confirmedCapacityLimit,
    confirmedCount: assignment.confirmedCount,
    pendingReviewCount: await countByRegistrationStatus(
      tournament.id,
      "pending_review",
    ),
    waitlistCount: Number(waitlistRows[0]?.total ?? 0),
    paymentRejectedCount: await countByPaymentStatus(tournament.id, "rejected"),
    assignment,
  };
}
