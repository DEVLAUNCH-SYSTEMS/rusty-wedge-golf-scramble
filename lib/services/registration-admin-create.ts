import {
  adminManualPaymentStatusSchema,
  resolveAdminManualPayment,
} from "@/lib/services/admin-manual-payment";
import { resolveAdminPaymentProof } from "@/lib/services/admin-payment-proof";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { confirmRegistrationIfCapacity } from "@/lib/services/capacity-confirm";
import {
  assertRegistrationEmailAvailable,
  insertRegistrationRecord,
} from "@/lib/services/player-create-shared";
import { ServiceError } from "@/lib/services/service-error";
import { requireWritableActiveTournament } from "@/lib/services/tournament";
import {
  normalizePlayerEmail,
  playerProfileSchema,
} from "@/lib/validation/player-profile";

import type { AdminSession } from "@/lib/services/admin-auth";
import type { AdminManualPaymentStatus } from "@/lib/services/admin-manual-payment";
import type { PlayerProfileInput } from "@/lib/validation/player-profile";

export type CreateAdminRegistrationInput = PlayerProfileInput & {
  paymentStatus: AdminManualPaymentStatus;
  paymentProofFile?: File | null;
  paymentProofPath?: string | null;
  paymentProofContentType?: string | null;
};

async function confirmCreatedRegistration(
  registrationId: string,
  tournamentId: string,
  admin: AdminSession,
): Promise<void> {
  const result = await confirmRegistrationIfCapacity({
    registrationId,
    tournamentId,
    adminUserId: admin.adminUserId,
  });

  if (!result.ok) {
    throw new ServiceError(
      "CAPACITY_FULL",
      `Capacity is full (${result.confirmedCount}/${result.capacityLimit} confirmed). Registration remains pending review.`,
    );
  }
}

export async function createAdminRegistration(
  input: CreateAdminRegistrationInput,
  admin: AdminSession,
): Promise<{ id: string }> {
  const tournament = await requireWritableActiveTournament();

  const profile = playerProfileSchema.parse(input);
  const paymentStatus = adminManualPaymentStatusSchema.parse(
    input.paymentStatus,
  );
  const payment = resolveAdminManualPayment(paymentStatus);
  const proof = await resolveAdminPaymentProof({
    paymentStatus,
    tournamentId: tournament.id,
    file: input.paymentProofFile,
    paymentProofPath: input.paymentProofPath,
    paymentProofContentType: input.paymentProofContentType,
  });

  const email = normalizePlayerEmail(profile.email);
  await assertRegistrationEmailAvailable(tournament.id, email);

  const created = await insertRegistrationRecord({
    tournamentId: tournament.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email,
    phone: profile.phone,
    skillLevel: profile.skillLevel,
    notes: profile.notes,
    preferredPlayers: profile.preferredPlayers,
    registrationStatus: "pending_review",
    paymentStatus: payment.insertPaymentStatus,
    paymentProofPath: proof.paymentProofPath,
    paymentProofContentType: proof.paymentProofContentType,
    markPaymentSubmittedAt: payment.markPaymentSubmittedAt,
    createdSource: "admin",
    createdByAdminId: admin.adminUserId,
  });

  if (payment.requiresCapacityConfirm) {
    await confirmCreatedRegistration(created.id, tournament.id, admin);
  }

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId: created.id,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.registrationCreatedByAdmin,
    metadata: {
      paymentStatus: payment.insertPaymentStatus,
      registrationStatus: payment.requiresCapacityConfirm
        ? "confirmed"
        : "pending_review",
    },
  });

  return created;
}
