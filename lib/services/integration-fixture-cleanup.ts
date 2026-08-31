import { eq, inArray, or, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  adminUsers,
  registrationEvents,
  registrations,
  teamMembers,
  teams,
  tournaments,
  waitlistEntries,
} from "@/lib/db/schema";

export type TournamentStateSnapshot = {
  lifecycleStatus: string;
  teamsPublished: boolean;
  registrationEnabled: boolean;
  isActive: boolean;
};

export type IntegrationFixtureCleanupInput = {
  adminUserIds?: string[];
  teamIds?: string[];
  registrationIds?: string[];
  waitlistEntryIds?: string[];
  tournamentIds?: string[];
  tournamentSnapshots?: Map<string, TournamentStateSnapshot>;
};

function uniqueIds(values: string[] | undefined): string[] {
  return [...new Set(values ?? [])];
}

async function deleteRegistrationEventsForFixtures(input: {
  adminUserIds: string[];
  teamIds: string[];
  registrationIds: string[];
  waitlistEntryIds: string[];
  tournamentIds: string[];
}): Promise<void> {
  const db = getDb();
  const filters = [];

  if (input.adminUserIds.length > 0) {
    filters.push(inArray(registrationEvents.adminUserId, input.adminUserIds));
  }

  if (input.teamIds.length > 0) {
    filters.push(inArray(registrationEvents.teamId, input.teamIds));
  }

  if (input.registrationIds.length > 0) {
    filters.push(inArray(registrationEvents.registrationId, input.registrationIds));
  }

  if (input.waitlistEntryIds.length > 0) {
    filters.push(inArray(registrationEvents.waitlistEntryId, input.waitlistEntryIds));
  }

  if (input.tournamentIds.length > 0) {
    filters.push(inArray(registrationEvents.tournamentId, input.tournamentIds));
  }

  if (filters.length === 0) {
    return;
  }

  await db.delete(registrationEvents).where(or(...filters));
}

async function deleteTeamMembersForTeams(teamIds: string[]): Promise<void> {
  if (teamIds.length === 0) {
    return;
  }

  const db = getDb();
  await db.delete(teamMembers).where(inArray(teamMembers.teamId, teamIds));
}

async function deleteTeamsById(teamIds: string[]): Promise<void> {
  if (teamIds.length === 0) {
    return;
  }

  const db = getDb();
  await db.delete(teams).where(inArray(teams.id, teamIds));
}

async function deleteRegistrationsById(registrationIds: string[]): Promise<void> {
  if (registrationIds.length === 0) {
    return;
  }

  const db = getDb();

  await db
    .update(waitlistEntries)
    .set({ promotedRegistrationId: null })
    .where(inArray(waitlistEntries.promotedRegistrationId, registrationIds));

  await db.delete(registrations).where(inArray(registrations.id, registrationIds));
}

async function deleteWaitlistEntriesById(waitlistEntryIds: string[]): Promise<void> {
  if (waitlistEntryIds.length === 0) {
    return;
  }

  const db = getDb();
  await db.delete(waitlistEntries).where(inArray(waitlistEntries.id, waitlistEntryIds));
}

async function clearAdminUserReferences(adminUserIds: string[]): Promise<void> {
  if (adminUserIds.length === 0) {
    return;
  }

  const db = getDb();

  await db
    .update(tournaments)
    .set({ archivedByAdminId: null })
    .where(inArray(tournaments.archivedByAdminId, adminUserIds));

  await db
    .update(waitlistEntries)
    .set({ createdByAdminId: null })
    .where(inArray(waitlistEntries.createdByAdminId, adminUserIds));

  await db
    .update(registrations)
    .set({ createdByAdminId: null, verifiedByAdminId: null })
    .where(
      or(
        inArray(registrations.createdByAdminId, adminUserIds),
        inArray(registrations.verifiedByAdminId, adminUserIds),
      ),
    );
}

async function deleteAdminUsersById(adminUserIds: string[]): Promise<void> {
  if (adminUserIds.length === 0) {
    return;
  }

  await clearAdminUserReferences(adminUserIds);

  const db = getDb();
  await db.delete(adminUsers).where(inArray(adminUsers.id, adminUserIds));
}

export async function deleteTournamentWithDependents(
  tournamentId: string,
): Promise<void> {
  const db = getDb();

  await db
    .delete(registrationEvents)
    .where(eq(registrationEvents.tournamentId, tournamentId));

  await db.execute(sql`
    DELETE FROM team_members tm
    USING teams t
    WHERE tm.team_id = t.id
      AND t.tournament_id = ${tournamentId}
  `);

  await db.delete(teams).where(eq(teams.tournamentId, tournamentId));

  await db.execute(sql`
    UPDATE waitlist_entries we
    SET promoted_registration_id = NULL
    FROM registrations r
    WHERE we.promoted_registration_id = r.id
      AND r.tournament_id = ${tournamentId}
  `);

  await db.delete(registrations).where(eq(registrations.tournamentId, tournamentId));
  await db.delete(waitlistEntries).where(eq(waitlistEntries.tournamentId, tournamentId));
  await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
}

async function restoreTournamentSnapshots(
  snapshots: Map<string, TournamentStateSnapshot>,
): Promise<void> {
  if (snapshots.size === 0) {
    return;
  }

  const db = getDb();

  for (const [tournamentId, snapshot] of snapshots.entries()) {
    await db
      .update(tournaments)
      .set({
        lifecycleStatus: snapshot.lifecycleStatus as never,
        teamsPublished: snapshot.teamsPublished,
        registrationEnabled: snapshot.registrationEnabled,
        isActive: snapshot.isActive,
      })
      .where(eq(tournaments.id, tournamentId));
  }
}

export async function cleanupIntegrationFixtures(
  input: IntegrationFixtureCleanupInput,
): Promise<void> {
  const adminUserIds = uniqueIds(input.adminUserIds);
  const teamIds = uniqueIds(input.teamIds);
  const registrationIds = uniqueIds(input.registrationIds);
  const waitlistEntryIds = uniqueIds(input.waitlistEntryIds);
  const tournamentIds = uniqueIds(input.tournamentIds);

  await deleteRegistrationEventsForFixtures({
    adminUserIds,
    teamIds,
    registrationIds,
    waitlistEntryIds,
    tournamentIds,
  });

  await deleteTeamMembersForTeams(teamIds);
  await deleteTeamsById(teamIds);
  await deleteRegistrationsById(registrationIds);
  await deleteWaitlistEntriesById(waitlistEntryIds);

  for (const tournamentId of tournamentIds) {
    await deleteTournamentWithDependents(tournamentId);
  }

  await deleteRegistrationEventsForFixtures({
    adminUserIds,
    teamIds: [],
    registrationIds: [],
    waitlistEntryIds: [],
    tournamentIds: [],
  });

  await deleteAdminUsersById(adminUserIds);
  await restoreTournamentSnapshots(input.tournamentSnapshots ?? new Map());
}
