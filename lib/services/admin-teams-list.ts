import { and, asc, count, eq, isNull, isNotNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers, teams } from "@/lib/db/schema";
import { computeTeamSlotsRemaining } from "@/lib/format/admin-team-capacity-display";
import { loadTeamRosterMembersByTeamId } from "@/lib/services/admin-team-list-roster";
import {
  adminTeamNumberListOrder,
  adminTeamsPlacementListOrderBy,
} from "@/lib/services/admin-teams-list-order";
import { requireAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { ServiceError } from "@/lib/services/service-error";
import { assertTournamentScope } from "@/lib/services/tournament";

import type { TeamRosterMember } from "@/lib/format/team-roster-display";
import type { AdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export type AdminTeamListItem = {
  id: string;
  name: string;
  teamNumber: number | null;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
  memberCount: number;
  createdAt: Date;
  rosterMembers: TeamRosterMember[];
};

export type AdminTeamMember = {
  registrationId: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
};

export type AdminTeamDetail = {
  id: string;
  name: string;
  teamNumber: number | null;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
  members: AdminTeamMember[];
  memberCount: number;
  slotsRemaining: number;
};

export type AdminAssignablePlayer = {
  id: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
};

function teamNumberOrder(sort: AdminTeamListSort) {
  return adminTeamNumberListOrder(sort);
}

async function tournamentHasPlacedTeams(
  tournamentId: string,
): Promise<boolean> {
  const db = getDb();
  const placedTeam = (
    await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(
          eq(teams.tournamentId, tournamentId),
          isNotNull(teams.finishingPlacement),
        ),
      )
      .limit(1)
  )[0];

  return Boolean(placedTeam);
}

export async function listTeamsForAdmin(
  sort: AdminTeamListSort = "asc",
): Promise<AdminTeamListItem[]> {
  const tournament = await requireAdminTournamentContext();
  const db = getDb();
  const usePlacementOrdering = await tournamentHasPlacedTeams(tournament.id);
  const orderBy = usePlacementOrdering
    ? adminTeamsPlacementListOrderBy()
    : [teamNumberOrder(sort)];

  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      teamNumber: teams.teamNumber,
      finishingPlacement: teams.finishingPlacement,
      scoreRelativeToPar: teams.scoreRelativeToPar,
      scoreTotalStrokes: teams.scoreTotalStrokes,
      createdAt: teams.createdAt,
      memberCount: count(teamMembers.id),
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(eq(teams.tournamentId, tournament.id))
    .groupBy(
      teams.id,
      teams.name,
      teams.teamNumber,
      teams.finishingPlacement,
      teams.scoreRelativeToPar,
      teams.scoreTotalStrokes,
      teams.createdAt,
    )
    .orderBy(...orderBy);

  const rosters = await loadTeamRosterMembersByTeamId(tournament.id);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    teamNumber: row.teamNumber,
    finishingPlacement: row.finishingPlacement,
    scoreRelativeToPar: row.scoreRelativeToPar,
    scoreTotalStrokes: row.scoreTotalStrokes,
    createdAt: row.createdAt,
    memberCount: Number(row.memberCount),
    rosterMembers: rosters.get(row.id) ?? [],
  }));
}

export async function getTeamDetailForAdmin(teamId: string): Promise<AdminTeamDetail> {
  const tournament = await requireAdminTournamentContext();
  const db = getDb();
  const team = (
    await db.select().from(teams).where(eq(teams.id, teamId)).limit(1)
  )[0];

  if (!team) {
    throw new ServiceError("NOT_FOUND", "Team not found.");
  }

  assertTournamentScope(team.tournamentId, tournament.id);

  const members = await db
    .select({
      registrationId: registrations.id,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      skillLevel: registrations.skillLevel,
    })
    .from(teamMembers)
    .innerJoin(registrations, eq(registrations.id, teamMembers.registrationId))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(asc(registrations.lastName), asc(registrations.firstName));

  const memberCount = members.length;

  return {
    id: team.id,
    name: team.name,
    teamNumber: team.teamNumber,
    finishingPlacement: team.finishingPlacement,
    scoreRelativeToPar: team.scoreRelativeToPar,
    scoreTotalStrokes: team.scoreTotalStrokes,
    members,
    memberCount,
    slotsRemaining: computeTeamSlotsRemaining(memberCount),
  };
}

export async function listAssignablePlayersForTeam(): Promise<AdminAssignablePlayer[]> {
  const tournament = await requireAdminTournamentContext();
  const db = getDb();

  return db
    .select({
      id: registrations.id,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      skillLevel: registrations.skillLevel,
    })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .where(
      and(
        eq(registrations.tournamentId, tournament.id),
        eq(registrations.registrationStatus, "confirmed"),
        isNull(teamMembers.id),
      ),
    )
    .orderBy(asc(registrations.lastName), asc(registrations.firstName));
}
