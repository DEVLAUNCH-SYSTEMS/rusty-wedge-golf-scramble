import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { confirmRegistrationIfCapacity } from "@/lib/services/capacity-confirm";
import { findRegistrationById } from "@/lib/services/registration-queries";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  requireActiveTournament,
} from "@/lib/services/tournament";
import {
  cancelRegistrationSchema,
  rejectRegistrationSchema,
  updateRegistrationNotesSchema,
} from "@/lib/validation/forms";

import type { AdminSession } from "@/lib/services/admin-auth";

async function requireScopedRegistration(registrationId: string) {
  const tournament = await requireActiveTournament();
  const registration = await findRegistrationById(registrationId);

  if (!registration) {
    throw new ServiceError("NOT_FOUND", "Registration not found.");
  }

  assertTournamentScope(registration.tournamentId, tournament.id);

  return { tournament, registration };
}

export async function verifyRegistrationPayment(
  registrationId: string,
  admin: AdminSession,
) {
  const { tournament, registration } =
    await requireScopedRegistration(registrationId);

  if (registration.registrationStatus !== "pending_review") {
    throw new ServiceError("INVALID_STATUS", "Registration is not pending review.");
  }

  if (registration.paymentStatus !== "submitted") {
    throw new ServiceError("INVALID_PAYMENT", "Payment has not been submitted.");
  }

  const result = await confirmRegistrationIfCapacity({
    registrationId,
    tournamentId: tournament.id,
    adminUserId: admin.adminUserId,
  });

  if (!result.ok) {
    throw new ServiceError(
      "CAPACITY_FULL",
      `Capacity is full (${result.confirmedCount}/${result.capacityLimit} confirmed). Registration remains pending review.`,
    );
  }
}

export async function rejectRegistrationPayment(
  registrationId: string,
  reason: string,
  admin: AdminSession,
) {
  const parsed = rejectRegistrationSchema.parse({ reason });
  const { tournament } = await requireScopedRegistration(registrationId);
  const db = getDb();

  await db
    .update(registrations)
    .set({
      paymentStatus: "rejected",
      rejectionReason: parsed.reason,
      rejectedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(registrations.id, registrationId));

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.paymentRejected,
    metadata: { rejectionReason: parsed.reason },
  });
}

export async function cancelRegistration(
  registrationId: string,
  adminNotes: string,
  admin: AdminSession,
) {
  const parsed = cancelRegistrationSchema.parse({ adminNotes });
  const { tournament, registration } =
    await requireScopedRegistration(registrationId);
  const db = getDb();

  await db
    .update(registrations)
    .set({
      registrationStatus: "cancelled",
      adminNotes: parsed.adminNotes,
      updatedAt: sql`now()`,
    })
    .where(eq(registrations.id, registrationId));

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.registrationCancelled,
    metadata: { priorStatus: registration.registrationStatus },
  });
}

export async function updateRegistrationNotes(
  registrationId: string,
  input: { paymentReviewNotes?: string; adminNotes?: string },
  admin: AdminSession,
) {
  const parsed = updateRegistrationNotesSchema.parse(input);
  const { tournament, registration } =
    await requireScopedRegistration(registrationId);
  const db = getDb();

  await db
    .update(registrations)
    .set({
      paymentReviewNotes:
        parsed.paymentReviewNotes ?? registration.paymentReviewNotes,
      adminNotes: parsed.adminNotes ?? registration.adminNotes,
      updatedAt: sql`now()`,
    })
    .where(eq(registrations.id, registrationId));

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.adminNotesUpdated,
    metadata: {
      fieldsChanged: [
        ...(parsed.paymentReviewNotes !== undefined
          ? ["payment_review_notes"]
          : []),
        ...(parsed.adminNotes !== undefined ? ["admin_notes"] : []),
      ],
    },
  });
}
