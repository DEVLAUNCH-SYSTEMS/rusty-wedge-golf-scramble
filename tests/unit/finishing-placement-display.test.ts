import { describe, expect, it } from "vitest";

import { formatFinishingPlacementLabel } from "@/lib/format/finishing-placement-display";

describe("formatFinishingPlacementLabel", () => {
  it.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
  ])("formats %i as %s", (placement, expected) => {
    expect(formatFinishingPlacementLabel(placement)).toBe(expected);
  });
});
