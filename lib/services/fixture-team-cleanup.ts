import { count, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { adminUsers, registrations, teamMembers, teams } from "@/lib/db/schema";
import { classifyFixtureTeamName } from "@/lib/db/team-number-fixture-patterns";
import { executeTeamDeleteTransaction } from "@/lib/services/team-delete-transaction";

export type FixtureTeamRow = {
  id: string;
  name: string;
  tournamentId: string;
  teamNumber: number | null;
  memberCount: number;
};

export type FixtureTeamCandidate = FixtureTeamRow & {
  patternId: string;
};

export type FixtureTeamPartition = {
  candidates: FixtureTeamCandidate[];
  nonCatalog: FixtureTeamRow[];
};

export function partitionTeamsByFixtureCatalog(rows: FixtureTeamRow[]): FixtureTeamPartition {
  const candidates: FixtureTeamCandidate[] = [];
  const nonCatalog: FixtureTeamRow[] = [];

  for (const row of rows) {
    const match = classifyFixtureTeamName(row.name);

    if (match) {
      candidates.push({ ...row, patternId: match.patternId });
      continue;
    }

    nonCatalog.push(row);
  }

  return { candidates, nonCatalog };
}

export async function listAllTeamsWithMemberCounts(): Promise<FixtureTeamRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      tournamentId: teams.tournamentId,
      teamNumber: teams.teamNumber,
      memberCount: count(teamMembers.id),
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .groupBy(teams.id, teams.name, teams.tournamentId, teams.teamNumber);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    tournamentId: row.tournamentId,
    teamNumber: row.teamNumber,
    memberCount: Number(row.memberCount),
  }));
}

export function summarizeFixtureCandidates(candidates: FixtureTeamCandidate[]) {
  const zeroMember = candidates.filter((row) => row.memberCount === 0).length;
  const populated = candidates.filter((row) => row.memberCount > 0).length;
  const byPattern: Record<string, number> = {};

  for (const candidate of candidates) {
    byPattern[candidate.patternId] = (byPattern[candidate.patternId] ?? 0) + 1;
  }

  return { total: candidates.length, zeroMember, populated, byPattern };
}

async function resolveCleanupAdminUserId(): Promise<string> {
  const db = getDb();
  const admin = (
    await db.select({ id: adminUsers.id }).from(adminUsers).limit(1)
  )[0];

  if (!admin) {
    throw new Error("No admin_users row found for fixture cleanup audit attribution.");
  }

  return admin.id;
}

export async function countRegistrations(): Promise<number> {
  const db = getDb();
  const rows = await db.select({ total: count() }).from(registrations);

  return Number(rows[0]?.total ?? 0);
}

export async function listRemainingNullTeamNumberRows(): Promise<
  Array<{
    id: string;
    name: string;
    memberCount: number;
    teamNumber: number | null;
  }>
> {
  const db = getDb();
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      teamNumber: teams.teamNumber,
      memberCount: count(teamMembers.id),
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(sql`${teams.teamNumber} IS NULL`)
    .groupBy(teams.id, teams.name, teams.teamNumber)
    .orderBy(teams.name);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    teamNumber: row.teamNumber,
    memberCount: Number(row.memberCount),
  }));
}

export type FixtureCleanupRunResult = {
  mode: "dry-run" | "execute";
  candidateCount: number;
  deletedCount: number;
  skippedNonCatalogCount: number;
  zeroMemberCandidates: number;
  populatedCandidates: number;
  registrationsBefore: number;
  registrationsAfter: number;
  failures: Array<{ teamId: string; teamName: string; error: string }>;
};

export async function runFixtureTeamCleanup(
  execute: boolean,
): Promise<FixtureCleanupRunResult> {
  const registrationsBefore = await countRegistrations();
  const allTeams = await listAllTeamsWithMemberCounts();
  const { candidates, nonCatalog } = partitionTeamsByFixtureCatalog(allTeams);
  const summary = summarizeFixtureCandidates(candidates);
  const failures: FixtureCleanupRunResult["failures"] = [];
  let deletedCount = 0;

  if (execute) {
    const adminUserId = await resolveCleanupAdminUserId();

    for (const candidate of candidates) {
      try {
        await executeTeamDeleteTransaction({
          teamId: candidate.id,
          tournamentId: candidate.tournamentId,
          adminUserId,
          memberCount: candidate.memberCount,
          teamName: candidate.name,
          teamNumber: candidate.teamNumber,
        });
        deletedCount += 1;
      } catch (error) {
        failures.push({
          teamId: candidate.id,
          teamName: candidate.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const registrationsAfter = await countRegistrations();

  return {
    mode: execute ? "execute" : "dry-run",
    candidateCount: summary.total,
    deletedCount,
    skippedNonCatalogCount: nonCatalog.length,
    zeroMemberCandidates: summary.zeroMember,
    populatedCandidates: summary.populated,
    registrationsBefore,
    registrationsAfter,
    failures,
  };
}
