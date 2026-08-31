import { describe, expect, it } from "vitest";

import {
  resolveResultsPublicationFormConfig,
  resultsPublicationStatusLabel,
} from "@/lib/content/results-publication-copy";

describe("results publication copy", () => {
  it("labels hidden and published states", () => {
    expect(resultsPublicationStatusLabel(false)).toBe("Hidden");
    expect(resultsPublicationStatusLabel(true)).toBe("Published");
  });

  it("resolves publish and hide form configs", () => {
    expect(resolveResultsPublicationFormConfig(false)).toEqual({
      submitLabel: "Publish results",
      pendingLabel: "Publishing…",
      danger: false,
    });
    expect(resolveResultsPublicationFormConfig(true)).toEqual({
      submitLabel: "Hide results",
      pendingLabel: "Hiding…",
      danger: true,
    });
  });
});
