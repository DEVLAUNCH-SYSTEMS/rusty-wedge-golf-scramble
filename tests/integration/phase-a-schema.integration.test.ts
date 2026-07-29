import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrations, tournaments } from "@/lib/db/schema";

import {
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

function errorText(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause =
    error.cause instanceof Error
      ? error.cause.message
      : error.cause
        ? String(error.cause)
        : "";

  return `${error.message}\n${cause}`;
}

describe.skipIf(!hasIntegrationDatabase())("phase A schema integration", () => {
  it("backfills active open tournament to registration_open", async () => {
    const db = getDb();
    const tournamentId = await getActiveTournamentId();
    const row = (
      await db
        .select({
          lifecycleStatus: tournaments.lifecycleStatus,
          registrationEnabled: tournaments.registrationEnabled,
          isActive: tournaments.isActive,
        })
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .limit(1)
    )[0];

    expect(row?.isActive).toBe(true);
    expect(row?.registrationEnabled).toBe(true);
    expect(row?.lifecycleStatus).toBe("registration_open");
  });

  it("defaults new registration provenance to public", async () => {
    const db = getDb();
    const tournamentId = await getActiveTournamentId();
    const inserted = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("provenance"),
      registrationStatus: "pending_review",
    });

    const row = (
      await db
        .select({
          createdSource: registrations.createdSource,
          createdByAdminId: registrations.createdByAdminId,
        })
        .from(registrations)
        .where(eq(registrations.id, inserted.id))
        .limit(1)
    )[0];

    expect(row?.createdSource).toBe("public");
    expect(row?.createdByAdminId).toBeNull();
  });

  it("enforces at most one active tournament", async () => {
    const db = getDb();
    const slug = `test-inactive-${randomUUID()}`;

    let caught: unknown;
    try {
      await db.insert(tournaments).values({
        name: "Second Active Tournament",
        slug,
        year: 2099,
        eventDate: "2099-01-01",
        locationName: "Test Course",
        venmoHandle: "@testvenmo",
        registrationEnabled: false,
        isActive: true,
        lifecycleStatus: "draft",
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeTruthy();
    expect(errorText(caught)).toMatch(
      /tournaments_single_active_unique|duplicate key|unique/i,
    );
  });

  it("keeps email and single-active partial indexes", async () => {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN (
          'tournaments_single_active_unique',
          'registrations_active_email_unique',
          'waitlist_entries_active_email_unique'
        )
      ORDER BY indexname
    `);

    const names = (rows.rows as { indexname: string }[]).map(
      (row) => row.indexname,
    );

    expect(names).toEqual([
      "registrations_active_email_unique",
      "tournaments_single_active_unique",
      "waitlist_entries_active_email_unique",
    ]);
  });
});
