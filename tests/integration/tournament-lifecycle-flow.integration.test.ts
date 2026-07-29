import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { tournaments } from "@/lib/db/schema";
import { createPendingRegistration } from "@/lib/services/registration-create";
import { ServiceError } from "@/lib/services/service-error";
import { registrationEnabledFromLifecycle } from "@/lib/services/tournament-lifecycle";
import { transitionTournamentLifecycle } from "@/lib/services/tournament-lifecycle-transition";

import { createTestAdminSession, uniqueTestEmail } from "./helpers";
import { deleteLifecycleTestTournament } from "./lifecycle-test-cleanup";

async function insertLifecycleFlowTournament() {
  const db = getDb();
  const row = (
    await db
      .insert(tournaments)
      .values({
        name: "Lifecycle Flow Test",
        slug: `lifecycle-flow-${randomUUID()}`,
        year: 2095,
        eventDate: "2095-06-01",
        locationName: "Test Course",
        venmoHandle: "@flowtest",
        lifecycleStatus: "registration_open",
        isActive: false,
        registrationEnabled: true,
      })
      .returning()
  )[0];

  if (!row) {
    throw new Error("Unable to insert lifecycle flow test tournament.");
  }

  return row;
}

describe.skipIf(!hasIntegrationDatabase())(
  "tournament lifecycle archive flow",
  () => {
    it("blocks public registration after transitioning through archive", async () => {
      const admin = await createTestAdminSession();
      let tournament = await insertLifecycleFlowTournament();

      try {
        for (const toStatus of [
          "registration_closed",
          "completed",
          "archived",
        ] as const) {
          tournament = await transitionTournamentLifecycle({
            tournamentId: tournament.id,
            toStatus,
            adminUserId: admin.adminUserId,
          });
          expect(tournament.registrationEnabled).toBe(false);
          expect(registrationEnabledFromLifecycle(tournament.lifecycleStatus)).toBe(
            false,
          );
        }

        await expect(
          createPendingRegistration(
            {
              firstName: "Pat",
              lastName: "Player",
              email: uniqueTestEmail("flow-archived-reg"),
              phone: "5095550104",
              skillLevel: "C",
              paymentProofPath: `payment-proofs/${tournament.id}/${randomUUID()}.png`,
              paymentProofContentType: "image/png",
            },
            tournament,
          ),
        ).rejects.toMatchObject({
          code: "REGISTRATION_CLOSED",
        } satisfies Partial<ServiceError>);

        const restored = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "completed",
          adminUserId: admin.adminUserId,
        });

        expect(restored.lifecycleStatus).toBe("completed");
        expect(restored.archivedAt).toBeNull();
      } finally {
        await deleteLifecycleTestTournament(tournament.id);
      }
    });
  },
);
