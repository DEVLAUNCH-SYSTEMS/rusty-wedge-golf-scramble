import { and, asc, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers, teams } from "@/lib/db/schema";
import { requireActiveTournament } from "@/lib/services/tournament";

import type { AdminRegistrationListFilters } from "@/lib/validation/admin-filters";

export type AdminRegistrationListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skillLevel: string;
  registrationStatus: string;
  paymentStatus: string;
  paymentSubmittedAt: Date | null;
  createdAt: Date;
  isAssigned: boolean;
  teamName: string | null;
};

function buildSearchCondition(query: string | undefined) {
  if (!query) {
    return undefined;
  }

  const pattern = `%${query}%`;

  return or(
    ilike(registrations.firstName, pattern),
    ilike(registrations.lastName, pattern),
    ilike(registrations.email, pattern),
  );
}

function buildFilterConditions(filters: AdminRegistrationListFilters) {
  const conditions = [];

  const search = buildSearchCondition(filters.q);
  if (search) {
    conditions.push(search);
  }

  if (filters.registrationStatus !== "all") {
    conditions.push(eq(registrations.registrationStatus, filters.registrationStatus));
  }

  if (filters.paymentStatus !== "all") {
    conditions.push(eq(registrations.paymentStatus, filters.paymentStatus));
  }

  if (filters.skillLevel !== "all") {
    conditions.push(eq(registrations.skillLevel, filters.skillLevel));
  }

  if (filters.assignment === "assigned") {
    conditions.push(isNotNull(teamMembers.id));
  }

  if (filters.assignment === "unassigned") {
    conditions.push(
      eq(registrations.registrationStatus, "confirmed"),
      isNull(teamMembers.id),
    );
  }

  return conditions;
}

export async function listRegistrationsForAdmin(
  filters: AdminRegistrationListFilters,
): Promise<AdminRegistrationListItem[]> {
  const tournament = await requireActiveTournament();
  const db = getDb();
  const conditions = [
    eq(registrations.tournamentId, tournament.id),
    ...buildFilterConditions(filters),
  ];

  const rows = await db
    .select({
      id: registrations.id,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      email: registrations.email,
      skillLevel: registrations.skillLevel,
      registrationStatus: registrations.registrationStatus,
      paymentStatus: registrations.paymentStatus,
      paymentSubmittedAt: registrations.paymentSubmittedAt,
      createdAt: registrations.createdAt,
      teamMemberId: teamMembers.id,
      teamName: teams.name,
    })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .leftJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(and(...conditions))
    .orderBy(
      desc(registrations.paymentSubmittedAt),
      desc(registrations.createdAt),
      asc(registrations.lastName),
      asc(registrations.firstName),
    );

  return rows.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    skillLevel: row.skillLevel,
    registrationStatus: row.registrationStatus,
    paymentStatus: row.paymentStatus,
    paymentSubmittedAt: row.paymentSubmittedAt,
    createdAt: row.createdAt,
    isAssigned: row.teamMemberId !== null,
    teamName: row.teamName,
  }));
}

export async function getAdminRegistrationDetail(registrationId: string) {
  const tournament = await requireActiveTournament();
  const db = getDb();

  const rows = await db
    .select({
      registration: registrations,
      teamName: teams.name,
      teamMemberId: teamMembers.id,
    })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .leftJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(
      and(
        eq(registrations.id, registrationId),
        eq(registrations.tournamentId, tournament.id),
      ),
    )
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    ...row.registration,
    teamName: row.teamName,
    isAssigned: row.teamMemberId !== null,
  };
}
