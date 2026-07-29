import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { tournaments } from "@/lib/db/schema";
import { createPendingRegistration } from "@/lib/services/registration-create";
import { ServiceError } from "@/lib/services/service-error";
import { requireActiveTournament } from "@/lib/services/tournament";
import { createWaitlistEntry } from "@/lib/services/waitlist-create";

import { uniqueTestEmail } from "./helpers";

describe.skipIf(!hasIntegrationDatabase())(
  "public registration lifecycle gates",
  () => {
    it("blocks public registration when lifecycle is not registration_open", async () => {
      const tournament = await requireActiveTournament();
      const db = getDb();
      const priorLifecycle = tournament.lifecycleStatus;
      const priorRegistrationEnabled = tournament.registrationEnabled;

      try {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: "registration_closed",
            registrationEnabled: true,
          })
          .where(eq(tournaments.id, tournament.id));

        await expect(
          createPendingRegistration(
            {
              firstName: "Pat",
              lastName: "Player",
              email: uniqueTestEmail("closed-reg"),
              phone: "5095550101",
              skillLevel: "C",
              paymentProofPath: `payment-proofs/${tournament.id}/${randomUUID()}.png`,
              paymentProofContentType: "image/png",
            },
            await requireActiveTournament(),
          ),
        ).rejects.toMatchObject({
          code: "REGISTRATION_CLOSED",
        } satisfies Partial<ServiceError>);
      } finally {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: priorLifecycle,
            registrationEnabled: priorRegistrationEnabled,
          })
          .where(eq(tournaments.id, tournament.id));
      }
    });

    it("blocks public waitlist when lifecycle is not registration_open", async () => {
      const tournament = await requireActiveTournament();
      const db = getDb();
      const priorLifecycle = tournament.lifecycleStatus;
      const priorRegistrationEnabled = tournament.registrationEnabled;

      try {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: "registration_closed",
            registrationEnabled: true,
          })
          .where(eq(tournaments.id, tournament.id));

        await expect(
          createWaitlistEntry(
            {
              firstName: "Pat",
              lastName: "Player",
              email: uniqueTestEmail("closed-wl"),
              phone: "5095550102",
              skillLevel: "B",
            },
            await requireActiveTournament(),
          ),
        ).rejects.toMatchObject({
          code: "REGISTRATION_CLOSED",
        } satisfies Partial<ServiceError>);
      } finally {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: priorLifecycle,
            registrationEnabled: priorRegistrationEnabled,
          })
          .where(eq(tournaments.id, tournament.id));
      }
    });

    it("blocks public registration when lifecycle is archived", async () => {
      const tournament = await requireActiveTournament();
      const db = getDb();
      const priorLifecycle = tournament.lifecycleStatus;
      const priorRegistrationEnabled = tournament.registrationEnabled;

      try {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: "archived",
            registrationEnabled: true,
          })
          .where(eq(tournaments.id, tournament.id));

        await expect(
          createPendingRegistration(
            {
              firstName: "Pat",
              lastName: "Player",
              email: uniqueTestEmail("archived-reg"),
              phone: "5095550103",
              skillLevel: "C",
              paymentProofPath: `payment-proofs/${tournament.id}/${randomUUID()}.png`,
              paymentProofContentType: "image/png",
            },
            await requireActiveTournament(),
          ),
        ).rejects.toMatchObject({
          code: "REGISTRATION_CLOSED",
        } satisfies Partial<ServiceError>);
      } finally {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: priorLifecycle,
            registrationEnabled: priorRegistrationEnabled,
          })
          .where(eq(tournaments.id, tournament.id));
      }
    });
  },
);
