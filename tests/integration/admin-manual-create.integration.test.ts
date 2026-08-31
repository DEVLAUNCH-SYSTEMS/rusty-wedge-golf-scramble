import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { tournaments, waitlistEntries } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";

import {
  adminManualCreateProfile as profile,
  findRegistrationById,
} from "./admin-manual-create-helpers";
import {
  createIntegrationAdminRegistration,
  createIntegrationAdminWaitlistEntry,
  createTestAdminSession,
  insertRegistrationRow,
  snapshotActiveTournament,
  uniqueTestEmail,
} from "./helpers";

describe.skipIf(!hasIntegrationDatabase())(
  "admin manual create provenance and duplicates",
  () => {
    it("sets admin provenance on registration and waitlist creates", async () => {
      const admin = await createTestAdminSession();
      const registration = await createIntegrationAdminRegistration(
        {
          ...profile,
          email: uniqueTestEmail("admin-reg-provenance"),
          paymentStatus: "submitted",
        },
        admin,
      );
      const waitlist = await createIntegrationAdminWaitlistEntry(
        { ...profile, email: uniqueTestEmail("admin-wl-provenance") },
        admin,
      );

      const registrationRow = await findRegistrationById(registration.id);
      const waitlistRow = (
        await getDb()
          .select()
          .from(waitlistEntries)
          .where(eq(waitlistEntries.id, waitlist.id))
          .limit(1)
      )[0];

      expect(registrationRow).toMatchObject({
        createdSource: "admin",
        createdByAdminId: admin.adminUserId,
        registrationStatus: "pending_review",
        paymentStatus: "submitted",
      });
      expect(waitlistRow).toMatchObject({
        createdSource: "admin",
        createdByAdminId: admin.adminUserId,
        status: "active",
      });
    });

    it("blocks duplicate registration email and email already on waitlist", async () => {
      const admin = await createTestAdminSession();
      const tournament = await requireActiveTournament();
      const takenRegistrationEmail = uniqueTestEmail("admin-reg-dup");
      const waitlistEmail = uniqueTestEmail("admin-reg-on-wl");

      await insertRegistrationRow({
        tournamentId: tournament.id,
        email: takenRegistrationEmail,
        registrationStatus: "pending_review",
      });
      await createIntegrationAdminWaitlistEntry(
        { ...profile, email: waitlistEmail },
        admin,
      );

      await expect(
        createIntegrationAdminRegistration(
          {
            ...profile,
            email: takenRegistrationEmail,
            paymentStatus: "submitted",
          },
          admin,
        ),
      ).rejects.toMatchObject({
        code: "DUPLICATE_REGISTRATION",
      } satisfies Partial<ServiceError>);

      await expect(
        createIntegrationAdminRegistration(
          {
            ...profile,
            email: waitlistEmail,
            paymentStatus: "submitted",
          },
          admin,
        ),
      ).rejects.toMatchObject({
        code: "EMAIL_ON_WAITLIST",
      } satisfies Partial<ServiceError>);
    });

    it("allows admin waitlist create when public registration is closed", async () => {
      const admin = await createTestAdminSession();
      const tournamentId = await snapshotActiveTournament();
      const db = getDb();

      try {
        await db
          .update(tournaments)
          .set({ registrationEnabled: false })
          .where(eq(tournaments.id, tournamentId));

        const created = await createIntegrationAdminWaitlistEntry(
          {
            ...profile,
            email: uniqueTestEmail("admin-wl-closed"),
          },
          admin,
        );

        expect(created.id).toBeTruthy();
      } finally {
        await db
          .update(tournaments)
          .set({ registrationEnabled: true })
          .where(eq(tournaments.id, tournamentId));
      }
    });

    it("rejects admin registration create when tournament is archived", async () => {
      const admin = await createTestAdminSession();
      const tournamentId = await snapshotActiveTournament();
      const db = getDb();

      try {
        await db
          .update(tournaments)
          .set({ lifecycleStatus: "archived" })
          .where(eq(tournaments.id, tournamentId));

        await expect(
          createIntegrationAdminRegistration(
            {
              ...profile,
              email: uniqueTestEmail("admin-reg-archived"),
              paymentStatus: "submitted",
            },
            admin,
          ),
        ).rejects.toMatchObject({
          code: "TOURNAMENT_ARCHIVED",
        } satisfies Partial<ServiceError>);
      } finally {
        await db
          .update(tournaments)
          .set({ lifecycleStatus: "registration_open" })
          .where(eq(tournaments.id, tournamentId));
      }
    });
  },
);
