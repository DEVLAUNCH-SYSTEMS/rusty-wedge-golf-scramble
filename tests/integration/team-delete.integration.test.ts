import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getDb } from "@/lib/db";
import { hasIntegrationDatabase } from "@/lib/db/ci-gate-env";
import {
  registrationEvents,
  registrations,
  teamMembers,
  teams,
  tournaments,
} from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES } from "@/lib/services/audit-types";
import { ServiceError } from "@/lib/services/service-error";
import {
  assignPlayerToTeam,
  createTeam,
  deleteTeam,
} from "@/lib/services/teams";

import {
  createTestAdminSession,
  getActiveTournamentId,
  insertRegistrationRow,
  uniqueTestEmail,
} from "./helpers";

function uniqueDeleteTestTeamName(label: string): string {
  return `Delete Test ${label} ${randomUUID()}`;
}

async function insertTeamInOtherTournament(name: string) {
  const db = getDb();
  const otherTournament = (
    await db
      .insert(tournaments)
      .values({
        name: "Delete Scope Test Tournament",
        slug: `delete-scope-${randomUUID()}`,
        year: 2096,
        eventDate: "2096-06-01",
        locationName: "Scope Test Course",
        venmoHandle: "@deletescope",
        registrationEnabled: false,
        isActive: false,
        lifecycleStatus: "registration_closed",
      })
      .returning({ id: tournaments.id })
  )[0];

  if (!otherTournament) {
    throw new Error("Unable to insert scope test tournament.");
  }

  const team = (
    await db
      .insert(teams)
      .values({ tournamentId: otherTournament.id, name, teamNumber: 1 })
      .returning({ id: teams.id })
  )[0];

  if (!team) {
    throw new Error("Unable to insert scope test team.");
  }

  return team.id;
}

describe.skipIf(!hasIntegrationDatabase())("delete team service", () => {
  it("deletes an empty team and records team_deleted audit metadata", async () => {
    const admin = await createTestAdminSession();
    const tournamentId = await getActiveTournamentId();
    const team = await createTeam(admin);
    const db = getDb();

    const deleted = await deleteTeam(team.id, admin);

    expect(deleted.memberCount).toBe(0);
    expect(deleted.teamName).toBe(team.name);

    const remainingTeam = (
      await db.select({ id: teams.id }).from(teams).where(eq(teams.id, team.id))
    )[0];
    expect(remainingTeam).toBeUndefined();

    const auditEvents = await db
      .select({
        eventType: registrationEvents.eventType,
        tournamentId: registrationEvents.tournamentId,
        metadata: registrationEvents.metadata,
        adminUserId: registrationEvents.adminUserId,
        teamId: registrationEvents.teamId,
      })
      .from(registrationEvents)
      .where(eq(registrationEvents.tournamentId, tournamentId));

    const deleteEvent = auditEvents.find(
      (event) =>
        event.eventType === AUDIT_EVENT_TYPES.teamDeleted &&
        (event.metadata as { teamName?: string })?.teamName === team.name,
    );

    expect(deleteEvent).toBeDefined();
    expect(deleteEvent?.adminUserId).toBe(admin.adminUserId);
    expect(deleteEvent?.teamId).toBeNull();
    expect(deleteEvent?.metadata).toMatchObject({
      memberCount: 0,
      teamName: team.name,
      teamNumber: team.teamNumber,
    });
  });

  it("deletes a populated team, removes team_members, and preserves registrations", async () => {
    const admin = await createTestAdminSession();
    const tournamentId = await getActiveTournamentId();
    const team = await createTeam(admin);
    const player = await insertRegistrationRow({
      tournamentId,
      email: uniqueTestEmail("delete-populated"),
      registrationStatus: "confirmed",
    });

    await assignPlayerToTeam(team.id, player!.id, admin);

    const deleted = await deleteTeam(team.id, admin);
    expect(deleted.memberCount).toBe(1);

    const db = getDb();
    const members = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, team.id));
    expect(members).toHaveLength(0);

    const registration = (
      await db
        .select({ id: registrations.id })
        .from(registrations)
        .where(eq(registrations.id, player!.id))
    )[0];
    expect(registration?.id).toBe(player!.id);
  });

  it("leaves an unrelated team unchanged when deleting a different team", async () => {
    const admin = await createTestAdminSession();
    const keepTeam = await createTeam(admin);
    const deleteTarget = await createTeam(admin);

    await deleteTeam(deleteTarget.id, admin);

    const db = getDb();
    const remaining = (
      await db
        .select({ id: teams.id, name: teams.name })
        .from(teams)
        .where(eq(teams.id, keepTeam.id))
    )[0];

    expect(remaining?.id).toBe(keepTeam.id);
    expect(remaining?.name).toBe(keepTeam.name);
  });

  it("denies delete for a team outside the active tournament", async () => {
    const admin = await createTestAdminSession();
    const otherTeamId = await insertTeamInOtherTournament(
      uniqueDeleteTestTeamName("other-tournament"),
    );

    await expect(deleteTeam(otherTeamId, admin)).rejects.toMatchObject({
      name: "ServiceError",
      code: "TOURNAMENT_SCOPE_MISMATCH",
    } satisfies Partial<ServiceError>);
  });

  it("denies delete for an unknown team id", async () => {
    const admin = await createTestAdminSession();

    await expect(deleteTeam(randomUUID(), admin)).rejects.toMatchObject({
      name: "ServiceError",
      code: "NOT_FOUND",
    } satisfies Partial<ServiceError>);
  });
});
