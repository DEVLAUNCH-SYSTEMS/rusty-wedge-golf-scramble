import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import {
  findRegistrationById,
  hasActiveRegistrationEmail,
  hasActiveWaitlistEmail,
} from "@/lib/services/registration-queries";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  requireWritableActiveTournament,
} from "@/lib/services/tournament";
import { updateRegistrationProfileSchema } from "@/lib/validation/forms";

import type { AdminSession } from "@/lib/services/admin-auth";
import type { UpdateRegistrationProfileInput } from "@/lib/validation/forms";

type RegistrationRow = NonNullable<
  Awaited<ReturnType<typeof findRegistrationById>>
>;

async function assertProfileEmailAvailable(
  tournamentId: string,
  email: string,
  registrationId: string,
): Promise<void> {
  if (await hasActiveRegistrationEmail(tournamentId, email, registrationId)) {
    throw new ServiceError(
      "DUPLICATE_EMAIL",
      "Another registration already uses this email.",
    );
  }

  if (await hasActiveWaitlistEmail(tournamentId, email)) {
    throw new ServiceError(
      "DUPLICATE_EMAIL",
      "An active waitlist entry already uses this email.",
    );
  }
}

function optionalText(value: string | null | undefined): string | null {
  return value ?? null;
}

function collectChangedProfileFields(
  before: RegistrationRow,
  after: UpdateRegistrationProfileInput,
): string[] {
  const fields: string[] = [];

  if (before.firstName !== after.firstName) fields.push("first_name");
  if (before.lastName !== after.lastName) fields.push("last_name");
  if (before.email.toLowerCase() !== after.email) fields.push("email");
  if (before.phone !== after.phone) fields.push("phone");
  if (before.skillLevel !== after.skillLevel) fields.push("skill_level");
  if (optionalText(before.preferredPlayers) !== optionalText(after.preferredPlayers)) {
    fields.push("preferred_players");
  }
  if (optionalText(before.notes) !== optionalText(after.notes)) {
    fields.push("notes");
  }

  return fields;
}

async function persistRegistrationProfile(
  registrationId: string,
  parsed: UpdateRegistrationProfileInput,
) {
  const db = getDb();
  const updated = await db
    .update(registrations)
    .set({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      skillLevel: parsed.skillLevel,
      preferredPlayers: parsed.preferredPlayers ?? null,
      notes: parsed.notes ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(registrations.id, registrationId))
    .returning({
      id: registrations.id,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      email: registrations.email,
      phone: registrations.phone,
      skillLevel: registrations.skillLevel,
      preferredPlayers: registrations.preferredPlayers,
      notes: registrations.notes,
    });

  const row = updated[0];

  if (!row) {
    throw new ServiceError("NOT_FOUND", "Registration not found.");
  }

  return row;
}

export async function updateRegistrationProfile(
  registrationId: string,
  input: UpdateRegistrationProfileInput | Record<string, unknown>,
  admin: AdminSession,
) {
  const parsed = updateRegistrationProfileSchema.parse(input);
  const tournament = await requireWritableActiveTournament();
  const registration = await findRegistrationById(registrationId);

  if (!registration) {
    throw new ServiceError("NOT_FOUND", "Registration not found.");
  }

  assertTournamentScope(registration.tournamentId, tournament.id);
  await assertProfileEmailAvailable(tournament.id, parsed.email, registrationId);

  const fieldsChanged = collectChangedProfileFields(registration, parsed);
  const row = await persistRegistrationProfile(registrationId, parsed);

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.registrationProfileUpdated,
    metadata: {
      fieldsChanged,
      ...(fieldsChanged.includes("email")
        ? { previousEmail: registration.email }
        : {}),
    },
  });

  return row;
}
