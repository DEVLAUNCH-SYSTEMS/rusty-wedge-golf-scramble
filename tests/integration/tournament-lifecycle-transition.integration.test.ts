import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { ServiceError } from "@/lib/services/service-error";
import { registrationEnabledFromLifecycle } from "@/lib/services/tournament-lifecycle";
import { transitionTournamentLifecycle } from "@/lib/services/tournament-lifecycle-transition";

import { createTestAdminSession } from "./helpers";
import { withExclusiveRegistrationOpen } from "./registration-open-test-helpers";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

async function insertLifecycleTestTournament(
  lifecycleStatus: TournamentLifecycleStatus,
  options?: { isActive?: boolean },
) {
  const db = getDb();

  const row = (
    await db
      .insert(tournaments)
      .values({
        name: "Lifecycle Transition Test",
        slug: `lifecycle-${randomUUID()}`,
        year: 2097,
        eventDate: "2097-06-01",
        locationName: "Test Course",
        venmoHandle: "@lifecycletest",
        lifecycleStatus,
        isActive: options?.isActive ?? false,
        registrationEnabled: registrationEnabledFromLifecycle(lifecycleStatus),
      })
      .returning()
  )[0];

  if (!row) {
    throw new Error("Unable to insert lifecycle test tournament.");
  }

  return row;
}

describe.skipIf(!hasIntegrationDatabase())(
  "tournament lifecycle transition service",
  () => {
    it("persists allowed transitions and syncs registration_enabled", async () => {
      const admin = await createTestAdminSession();

      await withExclusiveRegistrationOpen(admin.adminUserId, async () => {
        const tournament = await insertLifecycleTestTournament("draft");

        let current = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "registration_open",
          adminUserId: admin.adminUserId,
        });
        expect(current.lifecycleStatus).toBe("registration_open");
        expect(current.registrationEnabled).toBe(true);

        current = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "registration_closed",
          adminUserId: admin.adminUserId,
        });
        expect(current.lifecycleStatus).toBe("registration_closed");
        expect(current.registrationEnabled).toBe(false);

        current = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "registration_open",
          adminUserId: admin.adminUserId,
        });
        expect(current.registrationEnabled).toBe(true);

        current = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "registration_closed",
          adminUserId: admin.adminUserId,
        });

        current = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "completed",
          adminUserId: admin.adminUserId,
        });
        expect(current.lifecycleStatus).toBe("completed");
        expect(current.registrationEnabled).toBe(false);
      });
    });

    it("archives with metadata and clears is_active", async () => {
      const admin = await createTestAdminSession();
      const tournament = await insertLifecycleTestTournament("completed");
      const db = getDb();

      // Only one active row allowed — temporarily swap active flag onto the test row.
      const seededActiveId = (
        await db
          .select({ id: tournaments.id })
          .from(tournaments)
          .where(eq(tournaments.isActive, true))
          .limit(1)
      )[0]?.id;

      if (!seededActiveId) {
        throw new Error("Expected a seeded active tournament.");
      }

      try {
        await db
          .update(tournaments)
          .set({ isActive: false })
          .where(eq(tournaments.id, seededActiveId));
        await db
          .update(tournaments)
          .set({ isActive: true })
          .where(eq(tournaments.id, tournament.id));

        const archived = await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "archived",
          adminUserId: admin.adminUserId,
        });

        expect(archived.lifecycleStatus).toBe("archived");
        expect(archived.isActive).toBe(false);
        expect(archived.registrationEnabled).toBe(false);
        expect(archived.archivedAt).not.toBeNull();
        expect(archived.archivedByAdminId).toBe(admin.adminUserId);
      } finally {
        await db
          .update(tournaments)
          .set({ isActive: false })
          .where(eq(tournaments.id, tournament.id));
        await db
          .update(tournaments)
          .set({ isActive: true })
          .where(eq(tournaments.id, seededActiveId));
      }
    });

    it("restores archived tournaments to completed without reopening registration", async () => {
      const admin = await createTestAdminSession();
      const tournament = await insertLifecycleTestTournament("completed");

      await transitionTournamentLifecycle({
        tournamentId: tournament.id,
        toStatus: "archived",
        adminUserId: admin.adminUserId,
      });

      const restored = await transitionTournamentLifecycle({
        tournamentId: tournament.id,
        toStatus: "completed",
        adminUserId: admin.adminUserId,
      });

      expect(restored.lifecycleStatus).toBe("completed");
      expect(restored.registrationEnabled).toBe(false);
      expect(restored.isActive).toBe(false);
      expect(restored.archivedAt).toBeNull();
      expect(restored.archivedByAdminId).toBeNull();
    });

    it("rejects illegal lifecycle transitions", async () => {
      const admin = await createTestAdminSession();
      const tournament = await insertLifecycleTestTournament("draft");

      await expect(
        transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "archived",
          adminUserId: admin.adminUserId,
        }),
      ).rejects.toMatchObject({
        code: "INVALID_LIFECYCLE_TRANSITION",
      } satisfies Partial<ServiceError>);

      const db = getDb();
      const events = await db
        .select({ eventType: registrationEvents.eventType })
        .from(registrationEvents)
        .where(eq(registrationEvents.tournamentId, tournament.id));

      expect(
        events.some(
          (event) =>
            event.eventType === AUDIT_EVENT_TYPES.tournamentLifecycleChanged,
        ),
      ).toBe(false);
    });

    it("records tournament_lifecycle_changed with from/to metadata", async () => {
      const admin = await createTestAdminSession();

      await withExclusiveRegistrationOpen(admin.adminUserId, async () => {
        const tournament = await insertLifecycleTestTournament("draft");

        await transitionTournamentLifecycle({
          tournamentId: tournament.id,
          toStatus: "registration_open",
          adminUserId: admin.adminUserId,
        });

        const db = getDb();
        const events = await db
          .select({
            eventType: registrationEvents.eventType,
            metadata: registrationEvents.metadata,
            adminUserId: registrationEvents.adminUserId,
          })
          .from(registrationEvents)
          .where(eq(registrationEvents.tournamentId, tournament.id));

        const lifecycleEvent = events.find(
          (event) =>
            event.eventType === AUDIT_EVENT_TYPES.tournamentLifecycleChanged,
        );

        expect(lifecycleEvent?.adminUserId).toBe(admin.adminUserId);
        expect(lifecycleEvent?.metadata).toMatchObject({
          fromStatus: "draft",
          toStatus: "registration_open",
        });
      });
    });
  },
);
