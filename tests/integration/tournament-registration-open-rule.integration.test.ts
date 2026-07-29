import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import { registrationEvents, tournaments } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";
import { createTournament } from "@/lib/services/tournament-create";
import { transitionTournamentLifecycle } from "@/lib/services/tournament-lifecycle-transition";

import { createTestAdminSession, reserveUniqueTestYear } from "./helpers";
import {
  ensureSeedRegistrationOpen,
  withExclusiveRegistrationOpen,
} from "./registration-open-test-helpers";

const createdTournamentIds: string[] = [];

afterEach(async () => {
  const db = getDb();

  while (createdTournamentIds.length > 0) {
    const tournamentId = createdTournamentIds.pop()!;

    await db
      .delete(registrationEvents)
      .where(eq(registrationEvents.tournamentId, tournamentId));
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }
});

async function insertDraftLifecycleTournament() {
  const year = await reserveUniqueTestYear();

  return createTournament({
    name: "Registration Open Rule Test",
    slug: `${year}-open-rule-${randomUUID()}`,
    year,
    eventDate: `${year}-06-01`,
    locationName: "Open Rule Test Course",
    entryFeeCents: 8500,
    confirmedCapacityLimit: 68,
    venmoHandle: "@openruletest",
    lifecycleStatus: "draft",
  });
}

describe.skipIf(!hasIntegrationDatabase())(
  "tournament registration open rule",
  () => {
    it("rejects opening registration when another tournament is already open", async () => {
      const admin = await createTestAdminSession();
      const seedId = await ensureSeedRegistrationOpen(admin.adminUserId);
      const draft = await insertDraftLifecycleTournament();
      createdTournamentIds.push(draft.id);

      await expect(
        transitionTournamentLifecycle({
          tournamentId: draft.id,
          toStatus: "registration_open",
          adminUserId: admin.adminUserId,
        }),
      ).rejects.toMatchObject({
        code: "REGISTRATION_ALREADY_OPEN",
      } satisfies Partial<ServiceError>);

      const seed = (
        await getDb()
          .select({ lifecycleStatus: tournaments.lifecycleStatus })
          .from(tournaments)
          .where(eq(tournaments.id, seedId))
          .limit(1)
      )[0];

      expect(seed?.lifecycleStatus).toBe("registration_open");
    });

    it("allows opening registration after the other open tournament is closed", async () => {
      const admin = await createTestAdminSession();

      await withExclusiveRegistrationOpen(admin.adminUserId, async () => {
        const draft = await insertDraftLifecycleTournament();
        createdTournamentIds.push(draft.id);

        const opened = await transitionTournamentLifecycle({
          tournamentId: draft.id,
          toStatus: "registration_open",
          adminUserId: admin.adminUserId,
        });

        expect(opened.lifecycleStatus).toBe("registration_open");
        expect(opened.registrationEnabled).toBe(true);
      });
    });

    it("rejects creating a registration_open tournament while another is open", async () => {
      await ensureSeedRegistrationOpen(
        (await createTestAdminSession()).adminUserId,
      );

      const year = await reserveUniqueTestYear();

      await expect(
        createTournament({
          name: "Blocked Open Create",
          slug: `${year}-blocked-open-${randomUUID()}`,
          year,
          eventDate: `${year}-06-01`,
          locationName: "Blocked Open Course",
          entryFeeCents: 8500,
          confirmedCapacityLimit: 68,
          venmoHandle: "@blockedopen",
          lifecycleStatus: "registration_open",
        }),
      ).rejects.toMatchObject({
        code: "REGISTRATION_ALREADY_OPEN",
      } satisfies Partial<ServiceError>);
    });
  },
);
