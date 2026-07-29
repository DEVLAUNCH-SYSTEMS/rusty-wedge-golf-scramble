import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { ServiceError } from "@/lib/services/service-error";
import { registrationEnabledFromLifecycle } from "@/lib/services/tournament-lifecycle";
import { assertRegistrationOpenCreateAllowed } from "@/lib/services/tournament-registration-open-rule";
import { createTournamentSchema } from "@/lib/validation/tournament-create";

import type { Tournament } from "@/lib/services/tournament";
import type { CreateTournamentInput } from "@/lib/validation/tournament-create";

function normalizeTeeTime(
  teeTime: string | null | undefined,
): string | null {
  if (!teeTime) {
    return null;
  }

  return teeTime.length === 5 ? `${teeTime}:00` : teeTime;
}

async function findTournamentIdBySlug(slug: string): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);

  return rows[0]?.id ?? null;
}

async function findTournamentIdByYear(year: number): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.year, year))
    .limit(1);

  return rows[0]?.id ?? null;
}

export async function assertTournamentSlugAvailable(slug: string): Promise<void> {
  const existingId = await findTournamentIdBySlug(slug);

  if (existingId) {
    throw new ServiceError(
      "DUPLICATE_TOURNAMENT_SLUG",
      `A tournament with slug "${slug}" already exists.`,
    );
  }
}

export async function assertTournamentYearAvailable(year: number): Promise<void> {
  const existingId = await findTournamentIdByYear(year);

  if (existingId) {
    throw new ServiceError(
      "DUPLICATE_TOURNAMENT_YEAR",
      `A tournament for ${year} already exists.`,
    );
  }
}

function buildInsertValues(parsed: CreateTournamentInput) {
  return {
    name: parsed.name,
    slug: parsed.slug,
    year: parsed.year,
    eventDate: parsed.eventDate,
    teeTime: normalizeTeeTime(parsed.teeTime),
    locationName: parsed.locationName,
    entryFeeCents: parsed.entryFeeCents,
    confirmedCapacityLimit: parsed.confirmedCapacityLimit,
    venmoHandle: parsed.venmoHandle,
    lifecycleStatus: parsed.lifecycleStatus,
    registrationEnabled: registrationEnabledFromLifecycle(parsed.lifecycleStatus),
    isActive: false,
    registrationOpensAt: parsed.registrationOpensAt ?? null,
    registrationClosesAt: parsed.registrationClosesAt ?? null,
  };
}

export async function createTournament(
  input: CreateTournamentInput,
  audit?: { adminUserId: string },
): Promise<Tournament> {
  const parsed = createTournamentSchema.parse(input);

  await assertTournamentSlugAvailable(parsed.slug);
  await assertTournamentYearAvailable(parsed.year);

  if (parsed.lifecycleStatus === "registration_open") {
    await assertRegistrationOpenCreateAllowed();
  }

  const db = getDb();
  const rows = await db
    .insert(tournaments)
    .values(buildInsertValues(parsed))
    .returning();

  const created = rows[0];

  if (!created) {
    throw new ServiceError("CREATE_FAILED", "Unable to create tournament.");
  }

  if (audit) {
    await recordAuditEvent({
      tournamentId: created.id,
      adminUserId: audit.adminUserId,
      eventType: AUDIT_EVENT_TYPES.tournamentCreated,
      metadata: { year: created.year, slug: created.slug },
    });
  }

  return created;
}
