import { sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, waitlistEntries } from "@/lib/db/schema";
import {
  hasActiveRegistrationEmail,
  hasActiveWaitlistEmail,
} from "@/lib/services/registration-queries";
import {
  PUBLIC_ERROR_MESSAGE,
  ServiceError,
} from "@/lib/services/service-error";

import type { PlayerProfileInput } from "@/lib/validation/player-profile";

type CreatedSource = "public" | "admin" | "waitlist_promote";
type RegistrationStatus =
  | "pending_review"
  | "confirmed"
  | "waitlisted"
  | "cancelled";
type PaymentStatus =
  | "not_submitted"
  | "submitted"
  | "verified"
  | "rejected";

export async function assertRegistrationEmailAvailable(
  tournamentId: string,
  email: string,
): Promise<void> {
  if (await hasActiveRegistrationEmail(tournamentId, email)) {
    throw new ServiceError("DUPLICATE_REGISTRATION", PUBLIC_ERROR_MESSAGE);
  }

  if (await hasActiveWaitlistEmail(tournamentId, email)) {
    throw new ServiceError("EMAIL_ON_WAITLIST", PUBLIC_ERROR_MESSAGE);
  }
}

export async function assertWaitlistEmailAvailable(
  tournamentId: string,
  email: string,
): Promise<void> {
  if (await hasActiveWaitlistEmail(tournamentId, email)) {
    throw new ServiceError("DUPLICATE_WAITLIST", PUBLIC_ERROR_MESSAGE);
  }

  if (await hasActiveRegistrationEmail(tournamentId, email)) {
    throw new ServiceError("EMAIL_ALREADY_REGISTERED", PUBLIC_ERROR_MESSAGE);
  }
}

export type InsertRegistrationRecordInput = PlayerProfileInput & {
  tournamentId: string;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentProofPath?: string | null;
  paymentProofContentType?: string | null;
  markPaymentSubmittedAt?: boolean;
  sourceWaitlistEntryId?: string | null;
  createdSource?: CreatedSource;
  createdByAdminId?: string | null;
};

export async function insertRegistrationRecord(
  input: InsertRegistrationRecordInput,
): Promise<{ id: string }> {
  const db = getDb();
  const rows = await db
    .insert(registrations)
    .values({
      tournamentId: input.tournamentId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      skillLevel: input.skillLevel,
      notes: input.notes,
      preferredPlayers: input.preferredPlayers,
      registrationStatus: input.registrationStatus,
      paymentStatus: input.paymentStatus,
      paymentProofPath: input.paymentProofPath,
      paymentProofContentType: input.paymentProofContentType,
      paymentSubmittedAt: input.markPaymentSubmittedAt ? sql`now()` : undefined,
      sourceWaitlistEntryId: input.sourceWaitlistEntryId,
      createdSource: input.createdSource,
      createdByAdminId: input.createdByAdminId,
    })
    .returning({ id: registrations.id });

  const row = rows[0];

  if (!row) {
    throw new ServiceError("CREATE_FAILED", "Unable to create registration.");
  }

  return row;
}

export type InsertWaitlistRecordInput = PlayerProfileInput & {
  tournamentId: string;
  createdSource?: CreatedSource;
  createdByAdminId?: string | null;
};

export async function insertWaitlistRecord(
  input: InsertWaitlistRecordInput,
): Promise<{ id: string }> {
  const db = getDb();
  const rows = await db
    .insert(waitlistEntries)
    .values({
      tournamentId: input.tournamentId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      skillLevel: input.skillLevel,
      preferredPlayers: input.preferredPlayers,
      notes: input.notes,
      status: "active",
      createdSource: input.createdSource,
      createdByAdminId: input.createdByAdminId,
    })
    .returning({ id: waitlistEntries.id });

  const row = rows[0];

  if (!row) {
    throw new ServiceError("CREATE_FAILED", "Unable to create waitlist entry.");
  }

  return row;
}
