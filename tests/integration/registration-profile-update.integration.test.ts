import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import {
  registrationEvents,
  teamMembers,
  tournaments,
  waitlistEntries,
} from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { updateRegistrationProfile } from "@/lib/services/registration-profile-update";
import { ServiceError } from "@/lib/services/service-error";
import {
  assignPlayerToTeam,
  createTeam,
} from "@/lib/services/teams-mutations";

import {
  createTestAdminSession,
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

describe.skipIf(!hasIntegrationDatabase())(
  "registration profile update email conflicts",
  () => {
    it("allows keeping the same email on self", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const email = uniqueTestEmail("self-email");
      const row = await insertRegistrationRow({
        tournamentId,
        email,
        registrationStatus: "pending_review",
      });

      const updated = await updateRegistrationProfile(
        row.id,
        {
          firstName: "Pat",
          lastName: "Updated",
          email: email.toUpperCase(),
          phone: "5095550199",
          skillLevel: "C",
        },
        admin,
      );

      expect(updated.email).toBe(email.toLowerCase());
      expect(updated.lastName).toBe("Updated");
    });

    it("rejects email used by another active registration", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const takenEmail = uniqueTestEmail("taken-reg");
      const targetEmail = uniqueTestEmail("target-reg");

      await insertRegistrationRow({
        tournamentId,
        email: takenEmail,
        registrationStatus: "confirmed",
      });
      const target = await insertRegistrationRow({
        tournamentId,
        email: targetEmail,
        registrationStatus: "pending_review",
      });

      await expect(
        updateRegistrationProfile(
          target.id,
          {
            firstName: "Pat",
            lastName: "Player",
            email: takenEmail,
            phone: "5095550100",
            skillLevel: "B",
          },
          admin,
        ),
      ).rejects.toMatchObject({
        name: "ServiceError",
        code: "DUPLICATE_EMAIL",
      } satisfies Partial<ServiceError>);
    });

    it("rejects email used by an active waitlist entry", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const waitlistEmail = uniqueTestEmail("taken-wait");
      const targetEmail = uniqueTestEmail("target-wait");
      const db = getDb();

      await db.insert(waitlistEntries).values({
        tournamentId,
        firstName: "Wait",
        lastName: "Lister",
        email: waitlistEmail,
        phone: "5095550102",
        skillLevel: "A",
        status: "active",
      });

      const target = await insertRegistrationRow({
        tournamentId,
        email: targetEmail,
        registrationStatus: "pending_review",
      });

      await expect(
        updateRegistrationProfile(
          target.id,
          {
            firstName: "Pat",
            lastName: "Player",
            email: waitlistEmail,
            phone: "5095550100",
            skillLevel: "B",
          },
          admin,
        ),
      ).rejects.toMatchObject({
        name: "ServiceError",
        code: "DUPLICATE_EMAIL",
      } satisfies Partial<ServiceError>);
    });
  },
);

describe.skipIf(!hasIntegrationDatabase())(
  "registration profile update write guards",
  () => {
    it("rejects updates when the active tournament is archived", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const db = getDb();
      const email = uniqueTestEmail("archived-edit");
      const row = await insertRegistrationRow({
        tournamentId,
        email,
        registrationStatus: "pending_review",
      });

      const prior = (
        await db
          .select({ lifecycleStatus: tournaments.lifecycleStatus })
          .from(tournaments)
          .where(eq(tournaments.id, tournamentId))
          .limit(1)
      )[0];

      try {
        await db
          .update(tournaments)
          .set({ lifecycleStatus: "archived" })
          .where(eq(tournaments.id, tournamentId));

        await expect(
          updateRegistrationProfile(
            row.id,
            {
              firstName: "Pat",
              lastName: "Player",
              email,
              phone: "5095550100",
              skillLevel: "B",
            },
            admin,
          ),
        ).rejects.toMatchObject({
          name: "ServiceError",
          code: "TOURNAMENT_ARCHIVED",
        } satisfies Partial<ServiceError>);
      } finally {
        await db
          .update(tournaments)
          .set({
            lifecycleStatus: prior?.lifecycleStatus ?? "registration_open",
          })
          .where(eq(tournaments.id, tournamentId));
      }
    });

    it("rejects updates for registrations outside the active tournament", async () => {
      const admin = await createTestAdminSession();
      const db = getDb();
      const slug = `other-${randomUUID()}`;

      const otherTournament = (
        await db
          .insert(tournaments)
          .values({
            name: "Other Tournament",
            slug,
            year: 2098,
            eventDate: "2098-01-01",
            locationName: "Other Course",
            venmoHandle: "@othervenmo",
            registrationEnabled: false,
            isActive: false,
            lifecycleStatus: "registration_closed",
          })
          .returning({ id: tournaments.id })
      )[0];

      const row = await insertRegistrationRow({
        tournamentId: otherTournament.id,
        email: uniqueTestEmail("other-scope"),
        registrationStatus: "pending_review",
      });

      await expect(
        updateRegistrationProfile(
          row.id,
          {
            firstName: "Pat",
            lastName: "Player",
            email: uniqueTestEmail("other-scope-new"),
            phone: "5095550100",
            skillLevel: "B",
          },
          admin,
        ),
      ).rejects.toMatchObject({
        name: "ServiceError",
        code: "TOURNAMENT_SCOPE_MISMATCH",
      } satisfies Partial<ServiceError>);
    });
  },
);

describe.skipIf(!hasIntegrationDatabase())(
  "registration profile update audit",
  () => {
    it("records registration_profile_updated with fieldsChanged", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const previousEmail = uniqueTestEmail("audit-prev");
      const nextEmail = uniqueTestEmail("audit-next");
      const row = await insertRegistrationRow({
        tournamentId,
        email: previousEmail,
        registrationStatus: "pending_review",
      });

      await updateRegistrationProfile(
        row.id,
        {
          firstName: "Audit",
          lastName: "Player",
          email: nextEmail,
          phone: "5095550111",
          skillLevel: "D",
          notes: "Updated by admin",
        },
        admin,
      );

      const db = getDb();
      const events = await db
        .select({
          eventType: registrationEvents.eventType,
          metadata: registrationEvents.metadata,
          adminUserId: registrationEvents.adminUserId,
        })
        .from(registrationEvents)
        .where(eq(registrationEvents.registrationId, row.id));

      const profileEvent = events.find(
        (event) =>
          event.eventType === AUDIT_EVENT_TYPES.registrationProfileUpdated,
      );

      expect(profileEvent?.adminUserId).toBe(admin.adminUserId);
      expect(profileEvent?.metadata).toMatchObject({
        fieldsChanged: expect.arrayContaining([
          "first_name",
          "email",
          "phone",
          "skill_level",
          "notes",
        ]),
        previousEmail,
      });
    });
  },
);

describe.skipIf(!hasIntegrationDatabase())(
  "admin profile edit H-cases",
  () => {
    it("H-edit-success: updates profile fields for a pending registration", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const email = uniqueTestEmail("h-edit-success");
      const row = await insertRegistrationRow({
        tournamentId,
        email,
        registrationStatus: "pending_review",
      });

      const updated = await updateRegistrationProfile(
        row.id,
        {
          firstName: "Casey",
          lastName: "Fairway",
          email,
          phone: "5095550222",
          skillLevel: "A",
          preferredPlayers: "Riley",
          notes: "Early tee",
        },
        admin,
      );

      expect(updated).toMatchObject({
        firstName: "Casey",
        lastName: "Fairway",
        email: email.toLowerCase(),
        phone: "5095550222",
        skillLevel: "A",
        preferredPlayers: "Riley",
        notes: "Early tee",
      });
    });

    it("H-edit-invalid: rejects invalid profile payloads before persist", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const row = await insertRegistrationRow({
        tournamentId,
        email: uniqueTestEmail("h-edit-invalid"),
        registrationStatus: "pending_review",
      });

      await expect(
        updateRegistrationProfile(
          row.id,
          {
            firstName: "",
            lastName: "Player",
            email: "bad-email",
            phone: "12",
            skillLevel: "Z",
          },
          admin,
        ),
      ).rejects.toBeInstanceOf(ZodError);
    });

    it("H-edit-duplicate: blocks email already used by another active registration", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const takenEmail = uniqueTestEmail("h-edit-taken");
      const targetEmail = uniqueTestEmail("h-edit-target");

      await insertRegistrationRow({
        tournamentId,
        email: takenEmail,
        registrationStatus: "confirmed",
      });
      const target = await insertRegistrationRow({
        tournamentId,
        email: targetEmail,
        registrationStatus: "pending_review",
      });

      await expect(
        updateRegistrationProfile(
          target.id,
          {
            firstName: "Pat",
            lastName: "Player",
            email: takenEmail,
            phone: "5095550100",
            skillLevel: "B",
          },
          admin,
        ),
      ).rejects.toMatchObject({
        name: "ServiceError",
        code: "DUPLICATE_EMAIL",
      } satisfies Partial<ServiceError>);
    });

    it("H-edit-team-survives: team membership remains after rename and email change", async () => {
      const tournamentId = await getActiveTournamentId();
      const admin = await createTestAdminSession();
      const originalEmail = uniqueTestEmail("h-edit-team-old");
      const nextEmail = uniqueTestEmail("h-edit-team-new");
      const player = await insertRegistrationRow({
        tournamentId,
        email: originalEmail,
        registrationStatus: "confirmed",
      });
      const team = await createTeam(`H-edit team ${randomUUID()}`, admin);

      await assignPlayerToTeam(team.id, player.id, admin);

      await updateRegistrationProfile(
        player.id,
        {
          firstName: "Renamed",
          lastName: "Member",
          email: nextEmail,
          phone: "5095550333",
          skillLevel: "C",
        },
        admin,
      );

      const db = getDb();
      const membership = await db
        .select({
          teamId: teamMembers.teamId,
          registrationId: teamMembers.registrationId,
        })
        .from(teamMembers)
        .where(eq(teamMembers.registrationId, player.id));

      expect(membership).toEqual([
        {
          teamId: team.id,
          registrationId: player.id,
        },
      ]);
    });
  },
);
