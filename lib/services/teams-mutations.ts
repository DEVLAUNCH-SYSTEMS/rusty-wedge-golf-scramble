import { and, count, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teamMembers, teams } from "@/lib/db/schema";
import { AUDIT_EVENT_TYPES, recordAuditEvent } from "@/lib/services/audit";
import { findRegistrationById } from "@/lib/services/registration-queries";
import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  requireActiveTournament,
} from "@/lib/services/tournament";
import { createTeamSchema } from "@/lib/validation/forms";

import type { AdminSession } from "@/lib/services/admin-auth";

const MAX_TEAM_SIZE = 4;

async function countTeamMembers(teamId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ total: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return Number(rows[0]?.total ?? 0);
}

async function requireTeam(teamId: string) {
  const tournament = await requireActiveTournament();
  const db = getDb();
  const team = (
    await db.select().from(teams).where(eq(teams.id, teamId)).limit(1)
  )[0];

  if (!team) {
    throw new ServiceError("NOT_FOUND", "Team not found.");
  }

  assertTournamentScope(team.tournamentId, tournament.id);

  return { tournament, team };
}

export async function createTeam(name: string, admin: AdminSession) {
  const parsed = createTeamSchema.parse({ name });
  const tournament = await requireActiveTournament();
  const db = getDb();
  const team = (
    await db
      .insert(teams)
      .values({ tournamentId: tournament.id, name: parsed.name })
      .returning({ id: teams.id, name: teams.name })
  )[0];

  if (!team) {
    throw new ServiceError("CREATE_TEAM_FAILED", "Unable to create team.");
  }

  await recordAuditEvent({
    tournamentId: tournament.id,
    teamId: team.id,
    adminUserId: admin.adminUserId,
    eventType: AUDIT_EVENT_TYPES.teamCreated,
    metadata: { teamName: team.name },
  });

  return team;
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
