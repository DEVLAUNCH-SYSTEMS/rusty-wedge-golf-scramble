import { describe, expect, it } from "vitest";

import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { createAdminRegistration } from "@/lib/services/registration-admin-create";
import { ServiceError } from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";

import {
  adminManualCreateProfile as profile,
  countConfirmedRegistrations,
  findRegistrationByEmail,
  findRegistrationById,
  setConfirmedCapacityLimit,
} from "./admin-manual-create-helpers";
import { createTestAdminSession, uniqueTestEmail } from "./helpers";

// Parallel integration files also insert confirmed rows on the shared active
// tournament. Leave headroom so this suite does not flake on that race.
const CAPACITY_HEADROOM = 50;

describe.skipIf(!hasIntegrationDatabase())(
  "admin manual create capacity rules",
  () => {
    it("confirms verified create when capacity remains", async () => {
      const admin = await createTestAdminSession();
      const tournament = await requireActiveTournament();
      const originalLimit = tournament.confirmedCapacityLimit;
      const confirmed = await countConfirmedRegistrations(tournament.id);

      try {
        await setConfirmedCapacityLimit(
          tournament.id,
          confirmed + CAPACITY_HEADROOM,
        );

        const created = await createAdminRegistration(
          {
            ...profile,
            email: uniqueTestEmail("admin-verified-ok"),
            paymentStatus: "verified",
          },
          admin,
        );
        const row = await findRegistrationById(created.id);

        expect(row).toMatchObject({
          createdSource: "admin",
          createdByAdminId: admin.adminUserId,
          registrationStatus: "confirmed",
          paymentStatus: "verified",
        });
      } finally {
        await setConfirmedCapacityLimit(tournament.id, originalLimit);
      }
    });

    it("keeps pending on verified create when capacity is full", async () => {
      const admin = await createTestAdminSession();
      const tournament = await requireActiveTournament();
      const originalLimit = tournament.confirmedCapacityLimit;
      const email = uniqueTestEmail("admin-verified-full");

      try {
        // Limit 0 is always full (confirm uses confirmedCount >= limit).
        await setConfirmedCapacityLimit(tournament.id, 0);

        await expect(
          createAdminRegistration(
            { ...profile, email, paymentStatus: "verified" },
            admin,
          ),
        ).rejects.toMatchObject({
          code: "CAPACITY_FULL",
        } satisfies Partial<ServiceError>);

        expect(await findRegistrationByEmail(email)).toMatchObject({
          createdSource: "admin",
          createdByAdminId: admin.adminUserId,
          registrationStatus: "pending_review",
          paymentStatus: "submitted",
        });
      } finally {
        await setConfirmedCapacityLimit(tournament.id, originalLimit);
      }
    });

    it("allows submitted create when capacity is full", async () => {
      const admin = await createTestAdminSession();
      const tournament = await requireActiveTournament();
      const originalLimit = tournament.confirmedCapacityLimit;

      try {
        await setConfirmedCapacityLimit(tournament.id, 0);

        const created = await createAdminRegistration(
          {
            ...profile,
            email: uniqueTestEmail("admin-pending-full"),
            paymentStatus: "submitted",
          },
          admin,
        );

        expect(await findRegistrationById(created.id)).toMatchObject({
          registrationStatus: "pending_review",
          paymentStatus: "submitted",
          createdSource: "admin",
        });
      } finally {
        await setConfirmedCapacityLimit(tournament.id, originalLimit);
      }
    });
  },
);
