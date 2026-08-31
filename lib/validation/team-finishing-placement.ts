import { z } from "zod";

export const teamFinishingPlacementInputSchema = z
  .number()
  .int("Placement must be a whole number.")
  .min(1, "Placement must be at least 1.");

export type TeamFinishingPlacementInput = z.infer<
  typeof teamFinishingPlacementInputSchema
>;

export function parseTeamFinishingPlacementInput(
  value: unknown,
): TeamFinishingPlacementInput {
  return teamFinishingPlacementInputSchema.parse(value);
}
