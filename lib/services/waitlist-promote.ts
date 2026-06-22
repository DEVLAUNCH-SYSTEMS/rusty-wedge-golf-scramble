import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, waitlistEntries } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  requireActiveTournament,
} from "@/lib/services/tournament";
import { findWaitlistEntryById } from "@/lib/services/waitlist-create";

import type { AdminSession } from "@/lib/services/admin-auth";

async function requireActiveWaitlistEntry(waitlistEntryId: string) {
  const tournament = await requireActiveTournament();
  const entry = await findWaitlistEntryById(waitlistEntryId);

  if (!entry) {
    throw new ServiceError("NOT_FOUND", "Waitlist entry not found.");
  }

  assertTournamentScope(entry.tournamentId, tournament.id);

  if (entry.status !== "active") {
    throw new ServiceError("INVALID_STATUS", "Waitlist entry is not active.");
  }

  return { tournament, entry };
}

export async function promoteWaitlistEntry(
  waitlistEntryId: string,
  admin: AdminSession,
) {
  const { tournament, entry } =
    await requireActiveWaitlistEntry(waitlistEntryId);
  const db = getDb();
  const registration = (
    await db
      .insert(registrations)
      .values({
        tournamentId: tournament.id,
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        phone: entry.phone,
        skillLevel: entry.skillLevel,
        preferredPlayers: entry.preferredPlayers,
        notes: entry.notes,
        registrationStatus: "pending_review",
        paymentStatus: "not_submitted",
        sourceWaitlistEntryId: entry.id,
      })
      .returning({ id: registrations.id })
  )[0];

  if (!registration) {
    throw new ServiceError("PROMOTE_FAILED", "Unable to promote waitlist entry.");
  }

  await db
    .update(waitlistEntries)
    .set({
      status: "promoted",
      promotedRegistrationId: registration.id,
      updatedAt: sql`now()`,
    })
    .where(eq(waitlistEntries.id, waitlistEntryId));

  await recordAuditEvent({
    tournamentId: tournament.id,
    waitlistEntryId,
    registrationId: registration.id,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.waitlistPromoted,
    metadata: { promotedRegistrationId: registration.id },
  });

  return registration;
}
