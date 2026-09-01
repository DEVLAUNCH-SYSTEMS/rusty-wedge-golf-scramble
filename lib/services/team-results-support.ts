import { parseTeamFinishingPlacementInput } from "@/lib/validation/team-finishing-placement";
import {
  parseTeamScoreRelativeToParInput,
  parseTeamScoreTotalStrokesInput,
} from "@/lib/validation/team-score";

export type TeamScoreValues = {
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
};

export type BulkTeamResultsRow = {
  id: string;
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
};

export type ResolvedBulkTeamResultsEntry = BulkTeamResultsRow & {
  teamId: string;
};

export function bothScoresNull(
  scoreRelativeToPar: number | null,
  scoreTotalStrokes: number | null,
): boolean {
  return scoreRelativeToPar === null && scoreTotalStrokes === null;
}

export function normalizePlacementInput(placement: number | null): number | null {
  if (placement === null) {
    return null;
  }

  return parseTeamFinishingPlacementInput(placement);
}

export function normalizeScoreRelativeInput(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return parseTeamScoreRelativeToParInput(value);
}

export function normalizeScoreStrokesInput(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return parseTeamScoreTotalStrokesInput(value);
}

export function resolveOptionalScoreRelativeInput(
  value: number | null | undefined,
  current: number | null,
): number | null {
  if (value === undefined) {
    return current;
  }

  return normalizeScoreRelativeInput(value);
}

export function resolveOptionalScoreStrokesInput(
  value: number | null | undefined,
  current: number | null,
): number | null {
  if (value === undefined) {
    return current;
  }

  return normalizeScoreStrokesInput(value);
}

export function scoreFieldsChanged(
  before: TeamScoreValues,
  after: TeamScoreValues,
): boolean {
  return (
    before.scoreRelativeToPar !== after.scoreRelativeToPar ||
    before.scoreTotalStrokes !== after.scoreTotalStrokes
  );
}

export function scoreAuditEventType(
  before: TeamScoreValues,
  after: TeamScoreValues,
): "teamScoreSet" | "teamScoreCleared" {
  const hadScores = !bothScoresNull(
    before.scoreRelativeToPar,
    before.scoreTotalStrokes,
  );
  const hasScores = !bothScoresNull(
    after.scoreRelativeToPar,
    after.scoreTotalStrokes,
  );

  return hadScores && !hasScores ? "teamScoreCleared" : "teamScoreSet";
}
