import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, waitlistEntries } from "@/lib/db/schema";

const ACTIVE_REGISTRATION_STATUSES = ["pending_review", "confirmed"] as const;

export async function findRegistrationById(registrationId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);

  return rows[0] ?? null;
}

export async function hasActiveRegistrationEmail(
  tournamentId: string,
  email: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        sql`lower(${registrations.email}) = lower(${email})`,
        inArray(registrations.registrationStatus, [...ACTIVE_REGISTRATION_STATUSES]),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export async function hasActiveWaitlistEmail(
  tournamentId: string,
  email: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: waitlistEntries.id })
    .from(waitlistEntries)
    .where(
      and(
        eq(waitlistEntries.tournamentId, tournamentId),
        sql`lower(${waitlistEntries.email}) = lower(${email})`,
        eq(waitlistEntries.status, "active"),
      ),
    )
    .limit(1);

  return rows.length > 0;
}
