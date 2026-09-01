import { z } from "zod";

import { ServiceError } from "@/lib/services/service-error";

export const teamScoreRelativeToParInputSchema = z
  .number()
  .int("Relative-to-par must be a whole number.");

export const teamScoreTotalStrokesInputSchema = z
  .number()
  .int("Total strokes must be a whole number.")
  .min(1, "Total strokes must be at least 1.");

export type TeamScoreRelativeToParInput = z.infer<
  typeof teamScoreRelativeToParInputSchema
>;

export type TeamScoreTotalStrokesInput = z.infer<
  typeof teamScoreTotalStrokesInputSchema
>;

export function parseTeamScoreRelativeToParInput(
  value: unknown,
): TeamScoreRelativeToParInput {
  return teamScoreRelativeToParInputSchema.parse(value);
}

export function parseTeamScoreTotalStrokesInput(
  value: unknown,
): TeamScoreTotalStrokesInput {
  return teamScoreTotalStrokesInputSchema.parse(value);
}

const RELATIVE_TO_PAR_FIELD_PATTERN = /^[-+]?\d+$/;

export function formatScoreRelativeToParFieldValue(value: number | null): string {
  if (value == null) {
    return "";
  }

  if (value === 0) {
    return "E";
  }

  return String(value);
}

export function parseScoreRelativeToParFieldString(raw: string): number {
  const trimmed = raw.trim();

  if (trimmed.toLowerCase() === "e") {
    return 0;
  }

  if (!RELATIVE_TO_PAR_FIELD_PATTERN.test(trimmed)) {
    throw new ServiceError(
      "VALIDATION",
      "Relative-to-par must be a whole number, E, or left blank.",
    );
  }

  return parseTeamScoreRelativeToParInput(Number.parseInt(trimmed, 10));
}

function parseOptionalIntegerField(
  raw: FormDataEntryValue | null,
  invalidMessage: string,
): number | null | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (raw === null || typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  const parsed = Number.parseInt(raw.trim(), 10);

  if (Number.isNaN(parsed)) {
    throw new ServiceError("VALIDATION", invalidMessage);
  }

  return parsed;
}

export function parseOptionalScoreRelativeToParField(
  raw: FormDataEntryValue | null | undefined,
): number | null | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (raw === null || typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  return parseScoreRelativeToParFieldString(raw);
}

export function parseOptionalScoreTotalStrokesField(
  raw: FormDataEntryValue | null | undefined,
): number | null | undefined {
  if (raw === undefined) {
    return undefined;
  }

  const parsed = parseOptionalIntegerField(
    raw,
    "Total strokes must be a whole number of at least 1, or left blank.",
  );

  if (parsed === null || parsed === undefined) {
    return parsed;
  }

  return parseTeamScoreTotalStrokesInput(parsed);
}
