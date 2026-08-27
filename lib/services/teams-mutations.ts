import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { findRegistrationById } from "@/lib/services/registration-queries";
import { ServiceError } from "@/lib/services/service-error";
import { allocateAndInsertTeam } from "@/lib/services/team-number-allocate";
import {
  countTeamMembers,
  requireWritableTeam,
} from "@/lib/services/team-scope";
import {
  assertTournamentScope,
  assertTournamentWritable,
  requireActiveTournament,
} from "@/lib/services/tournament";

import type { AdminSession } from "@/lib/services/admin-auth";

export const MAX_TEAM_SIZE = 4;

async function requireTeam(teamId: string) {
  return requireWritableTeam(teamId);
}

export async function createTeam(admin: AdminSession) {
  const tournament = await requireActiveTournament();
  assertTournamentWritable(tournament);
  const team = await allocateAndInsertTeam(tournament.id);

  await recordAuditEvent({
    tournamentId: tournament.id,
    teamId: team.id,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.teamCreated,
    metadata: { teamName: team.name, teamNumber: team.teamNumber },
  });

  return team;
}

async function requireUnassignedRegistration(registrationId: string) {
  const db = getDb();
  const existing = (
    await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.registrationId, registrationId))
      .limit(1)
  )[0];

  if (existing) {
    throw new ServiceError(
      "ALREADY_ASSIGNED",
      "Player is already assigned to a team.",
    );
  }
}

export async function assignPlayerToTeam(
  teamId: string,
  registrationId: string,
  admin: AdminSession,
) {
  const { tournament, team } = await requireTeam(teamId);
  const registration = await findRegistrationById(registrationId);

  if (!registration) {
    throw new ServiceError("NOT_FOUND", "Registration not found.");
  }

  assertTournamentScope(registration.tournamentId, tournament.id);

  if (registration.registrationStatus !== "confirmed") {
    throw new ServiceError(
      "NOT_CONFIRMED",
      "Only confirmed players can be assigned to teams.",
    );
  }

  if ((await countTeamMembers(teamId)) >= MAX_TEAM_SIZE) {
    throw new ServiceError("TEAM_FULL", "Teams cannot exceed four players.");
  }

  await requireUnassignedRegistration(registrationId);

  const db = getDb();
  await db.insert(teamMembers).values({
    teamId,
    registrationId,
    assignedByAdminId: admin.adminUserId,
  });

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId,
    teamId,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.playerAssignedToTeam,
    metadata: {
      teamName: team.name,
      playerName: `${registration.firstName} ${registration.lastName}`,
    },
  });
}

export async function removePlayerFromTeam(
  teamId: string,
  registrationId: string,
  admin: AdminSession,
) {
  const { tournament, team } = await requireTeam(teamId);
  const registration = await findRegistrationById(registrationId);

  if (!registration) {
    throw new ServiceError("NOT_FOUND", "Registration not found.");
  }

  assertTournamentScope(registration.tournamentId, tournament.id);

  const db = getDb();
  await db
    .delete(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.registrationId, registrationId),
      ),
    );

  await recordAuditEvent({
    tournamentId: tournament.id,
    registrationId,
    teamId,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.playerRemovedFromTeam,
    metadata: {
      teamName: team.name,
      playerName: `${registration.firstName} ${registration.lastName}`,
    },
  });
}
