import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import {
  parseTeamFinishingPlacementInput,
  teamFinishingPlacementInputSchema,
} from "@/lib/validation/team-finishing-placement";

describe("teamFinishingPlacementInputSchema", () => {
  it("accepts positive integers", () => {
    expect(parseTeamFinishingPlacementInput(1)).toBe(1);
    expect(parseTeamFinishingPlacementInput(42)).toBe(42);
  });

  it("rejects zero and negative values", () => {
    expect(() => parseTeamFinishingPlacementInput(0)).toThrow(ZodError);
    expect(() => parseTeamFinishingPlacementInput(-1)).toThrow(ZodError);
  });

  it("rejects non-integers", () => {
    expect(() => teamFinishingPlacementInputSchema.parse(1.5)).toThrow(ZodError);
  });
});
