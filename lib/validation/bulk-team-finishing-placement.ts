import { z } from "zod";

import { ServiceError } from "@/lib/services/service-error";
import { parseTeamFinishingPlacementInput } from "@/lib/validation/team-finishing-placement";

export type BulkTeamFinishingPlacementEntry = {
  teamId: string;
  finishingPlacement: number | null;
};

const teamIdSchema = z.string().uuid("Each team id must be valid.");

export function parseOptionalTeamFinishingPlacementField(
  raw: FormDataEntryValue | null,
): number | null {
  if (raw === null || typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  const parsed = Number.parseInt(raw.trim(), 10);

  if (Number.isNaN(parsed)) {
    throw new ServiceError(
      "VALIDATION",
      "Each placement must be a whole number of at least 1, or left blank.",
    );
  }

  return parseTeamFinishingPlacementInput(parsed);
}

export function parseBulkFinishingPlacementsFromFormData(
  formData: FormData,
): BulkTeamFinishingPlacementEntry[] {
  const teamIds = [
    ...new Set(
      formData
        .getAll("teamIds")
        .map((value) => (typeof value === "string" ? value : ""))
        .filter((value) => value.length > 0),
    ),
  ];

  return teamIds.map((teamId) => {
    teamIdSchema.parse(teamId);

    const placementValues = formData.getAll(`placement_${teamId}`);
    const rawPlacement = placementValues.at(-1) ?? null;

    return {
      teamId,
      finishingPlacement: parseOptionalTeamFinishingPlacementField(rawPlacement),
    };
  });
}

export function assertCompleteBulkTeamCoverage(
  tournamentTeamIds: readonly string[],
  entries: readonly BulkTeamFinishingPlacementEntry[],
): void {
  if (entries.length !== tournamentTeamIds.length) {
    throw new ServiceError(
      "VALIDATION",
      "Submit finishing placements for every team.",
    );
  }

  const tournamentIds = new Set(tournamentTeamIds);
  const submittedIds = new Set<string>();

  for (const entry of entries) {
    if (submittedIds.has(entry.teamId)) {
      throw new ServiceError("VALIDATION", "Duplicate team entries are not allowed.");
    }

    submittedIds.add(entry.teamId);

    if (!tournamentIds.has(entry.teamId)) {
      throw new ServiceError("NOT_FOUND", "Team not found.");
    }
  }
}
