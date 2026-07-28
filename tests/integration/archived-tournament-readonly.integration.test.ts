import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { tournaments, waitlistEntries } from "@/lib/db/schema";
import { listRegistrationsForAdmin } from "@/lib/services/admin-registration-list";
import { exportRegistrationsCsv } from "@/lib/services/csv-export";
import {
  cancelRegistration,
  verifyRegistrationPayment,
} from "@/lib/services/registration-admin";
import { ServiceError } from "@/lib/services/service-error";
import { createTeam } from "@/lib/services/teams-mutations";
import { requireActiveTournament } from "@/lib/services/tournament";
import { promoteWaitlistEntry } from "@/lib/services/waitlist-promote";

import {
  createTestAdminSession,
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

async function withArchivedActiveTournament(
  run: () => Promise<void>,
): Promise<void> {
  const tournament = await requireActiveTournament();
  const db = getDb();

  try {
    await db
      .update(tournaments)
      .set({ lifecycleStatus: "archived" })
      .where(eq(tournaments.id, tournament.id));

    await run();
  } finally {
    await db
      .update(tournaments)
      .set({ lifecycleStatus: tournament.lifecycleStatus })
      .where(eq(tournaments.id, tournament.id));
  }
}

describe.skipIf(!hasIntegrationDatabase())(
  "archived tournament read-only enforcement",
  () => {
    it("blocks admin write mutations with TOURNAMENT_ARCHIVED", async () => {
      const admin = await createTestAdminSession();
      const tournamentId = await getActiveTournamentId();
      const db = getDb();
      const registration = await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("archived-verify"),
        registrationStatus: "pending_review",
        paymentStatus: "submitted",
      });
      const waitlist = (
        await db
          .insert(waitlistEntries)
          .values({
            tournamentId,
            firstName: "Wait",
            lastName: "Listed",
            email: uniqueTestEmail("archived-waitlist"),
            phone: "5095550100",
            skillLevel: "B",
            status: "active",
          })
          .returning({ id: waitlistEntries.id })
      )[0];

      if (!registration?.id || !waitlist?.id) {
        throw new Error("Unable to seed archived read-only test data.");
      }

      await withArchivedActiveTournament(async () => {
        await expect(
          verifyRegistrationPayment(registration.id, admin),
        ).rejects.toMatchObject({
          code: "TOURNAMENT_ARCHIVED",
        } satisfies Partial<ServiceError>);

        await expect(
          cancelRegistration(registration.id, "Test cancel", admin),
        ).rejects.toMatchObject({
          code: "TOURNAMENT_ARCHIVED",
        } satisfies Partial<ServiceError>);

        await expect(createTeam("Archived Guard Team", admin)).rejects.toMatchObject({
          code: "TOURNAMENT_ARCHIVED",
        } satisfies Partial<ServiceError>);

        await expect(
          promoteWaitlistEntry(waitlist.id, admin),
        ).rejects.toMatchObject({
          code: "TOURNAMENT_ARCHIVED",
        } satisfies Partial<ServiceError>);
      });
    });

    it("still allows registration list and CSV export reads", async () => {
      await withArchivedActiveTournament(async () => {
        const registrations = await listRegistrationsForAdmin({
          q: "",
          registrationStatus: "all",
          paymentStatus: "all",
          skillLevel: "all",
          assignment: "all",
        });
        const csv = await exportRegistrationsCsv();

        expect(Array.isArray(registrations)).toBe(true);
        expect(csv).toContain("first_name");
        expect(csv).toContain("last_name");
      });
    });
  },
);
