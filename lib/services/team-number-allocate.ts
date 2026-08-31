import { eq, max } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { ServiceError } from "@/lib/services/service-error";

export const TEAM_NUMBER_ALLOCATION_MAX_RETRIES = 12;

export type AllocatedTeamRow = {
  id: string;
  name: string;
  teamNumber: number;
};

export function formatInternalTeamName(teamNumber: number): string {
  return `Team #${teamNumber}`;
}

export function isUniqueConstraintError(error: unknown): boolean {
  const candidates = collectErrorCandidates(error);

  return candidates.some((entry) => {
    if (entry.code === "23505") {
      return true;
    }

    return /teams_tournament_number_unique|duplicate key|unique constraint/i.test(
      entry.message,
    );
  });
}

function collectErrorCandidates(error: unknown): Array<{ code?: string; message: string }> {
  if (!(error instanceof Error)) {
    return [{ message: String(error) }];
  }

  const entries: Array<{ code?: string; message: string }> = [
    {
      code: (error as { code?: string }).code,
      message: error.message,
    },
  ];

  if (error.cause) {
    entries.push({
      code: (error.cause as { code?: string }).code,
      message:
        error.cause instanceof Error ? error.cause.message : String(error.cause),
    });
  }

  return entries;
}

export async function queryNextTeamNumber(tournamentId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ highest: max(teams.teamNumber) })
    .from(teams)
    .where(eq(teams.tournamentId, tournamentId));

  return Number(rows[0]?.highest ?? 0) + 1;
}

async function insertNumberedTeam(
  tournamentId: string,
  teamNumber: number,
): Promise<AllocatedTeamRow> {
  const db = getDb();
  const team = (
    await db
      .insert(teams)
      .values({
        tournamentId,
        teamNumber,
        name: formatInternalTeamName(teamNumber),
      })
      .returning({
        id: teams.id,
        name: teams.name,
        teamNumber: teams.teamNumber,
      })
  )[0];

  if (!team) {
    throw new ServiceError("CREATE_TEAM_FAILED", "Unable to create team.");
  }

  return team;
}

export async function allocateAndInsertTeam(
  tournamentId: string,
): Promise<AllocatedTeamRow> {
  let lastError: unknown;

  for (let attempt = 0; attempt < TEAM_NUMBER_ALLOCATION_MAX_RETRIES; attempt += 1) {
    const teamNumber = await queryNextTeamNumber(tournamentId);

    try {
      return await insertNumberedTeam(tournamentId, teamNumber);
    } catch (error) {
      lastError = error;

      if (isUniqueConstraintError(error)) {
        continue;
      }

      throw error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new ServiceError(
    "CREATE_TEAM_FAILED",
    "Unable to allocate a unique team number after several attempts.",
  );
}
