import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import { parseTeamResultsFromFormData } from "@/lib/validation/team-results-form";

function teamResultsFormData(fields: {
  finishingPlacement?: string;
  scoreRelativeToPar?: string;
  scoreTotalStrokes?: string;
}): FormData {
  const formData = new FormData();

  if (fields.finishingPlacement !== undefined) {
    formData.set("finishingPlacement", fields.finishingPlacement);
  }

  if (fields.scoreRelativeToPar !== undefined) {
    formData.set("scoreRelativeToPar", fields.scoreRelativeToPar);
  }

  if (fields.scoreTotalStrokes !== undefined) {
    formData.set("scoreTotalStrokes", fields.scoreTotalStrokes);
  }

  return formData;
}

describe("parseTeamResultsFromFormData", () => {
  it("parses placement-only updates", () => {
    expect(
      parseTeamResultsFromFormData(teamResultsFormData({ finishingPlacement: "2" })),
    ).toEqual({
      finishingPlacement: 2,
    });
  });

  it("parses score-only updates with blank placement", () => {
    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          finishingPlacement: "",
          scoreRelativeToPar: "-7",
          scoreTotalStrokes: "64",
        }),
      ),
    ).toEqual({
      finishingPlacement: null,
      scoreRelativeToPar: -7,
      scoreTotalStrokes: 64,
    });
  });

  it("accepts zero relative-to-par and signed values", () => {
    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "0",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: 0,
    });

    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "2",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: 2,
    });

    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "+2",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: 2,
    });
  });

  it("accepts golf even notation for relative-to-par", () => {
    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "E",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: 0,
    });

    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "e",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: 0,
    });
  });

  it("parses relative-only and strokes-only submissions", () => {
    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "-3",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: -3,
    });

    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreTotalStrokes: "71",
        }),
      ),
    ).toEqual({
      scoreTotalStrokes: 71,
    });
  });

  it("treats blank score fields as clears", () => {
    expect(
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreRelativeToPar: "",
          scoreTotalStrokes: "",
        }),
      ),
    ).toEqual({
      scoreRelativeToPar: null,
      scoreTotalStrokes: null,
    });
  });

  it("rejects invalid strokes before service call", () => {
    expect(() =>
      parseTeamResultsFromFormData(
        teamResultsFormData({
          scoreTotalStrokes: "0",
        }),
      ),
    ).toThrow();
  });

  it("rejects empty submissions", () => {
    expect(() => parseTeamResultsFromFormData(new FormData())).toThrow(ServiceError);
  });
});
