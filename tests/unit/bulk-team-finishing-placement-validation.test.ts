import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { ServiceError } from "@/lib/services/service-error";
import {
  assertCompleteBulkTeamCoverage,
  parseBulkFinishingPlacementsFromFormData,
  parseOptionalTeamFinishingPlacementField,
} from "@/lib/validation/bulk-team-finishing-placement";

const TEAM_ONE = "11111111-1111-4111-8111-111111111111";
const TEAM_TWO = "22222222-2222-4222-8222-222222222222";
const TEAM_THREE = "33333333-3333-4333-8333-333333333333";

function bulkFormData(
  entries: Array<{
    teamId: string;
    placement: string;
    scoreRelativeToPar?: string;
    scoreTotalStrokes?: string;
  }>,
): FormData {
  const formData = new FormData();

  for (const entry of entries) {
    formData.append("teamIds", entry.teamId);
    formData.set(`placement_${entry.teamId}`, entry.placement);

    if (entry.scoreRelativeToPar !== undefined) {
      formData.set(`scoreRelativeToPar_${entry.teamId}`, entry.scoreRelativeToPar);
    }

    if (entry.scoreTotalStrokes !== undefined) {
      formData.set(`scoreTotalStrokes_${entry.teamId}`, entry.scoreTotalStrokes);
    }
  }

  return formData;
}

describe("parseOptionalTeamFinishingPlacementField", () => {
  it("returns null for blank values", () => {
    expect(parseOptionalTeamFinishingPlacementField(null)).toBeNull();
    expect(parseOptionalTeamFinishingPlacementField("")).toBeNull();
    expect(parseOptionalTeamFinishingPlacementField("   ")).toBeNull();
  });

  it("accepts positive integers", () => {
    expect(parseOptionalTeamFinishingPlacementField("1")).toBe(1);
    expect(parseOptionalTeamFinishingPlacementField("11")).toBe(11);
  });

  it("rejects invalid and non-positive values", () => {
    expect(() => parseOptionalTeamFinishingPlacementField("abc")).toThrow(ServiceError);
    expect(() => parseOptionalTeamFinishingPlacementField("0")).toThrow();
    expect(() => parseOptionalTeamFinishingPlacementField("-1")).toThrow();
  });
});

describe("parseBulkFinishingPlacementsFromFormData", () => {
  it("parses placements for each submitted team", () => {
    const entries = parseBulkFinishingPlacementsFromFormData(
      bulkFormData([
        { teamId: TEAM_ONE, placement: "1" },
        { teamId: TEAM_TWO, placement: "1" },
        { teamId: TEAM_THREE, placement: "" },
      ]),
    );

    expect(entries).toEqual([
      { teamId: TEAM_ONE, finishingPlacement: 1 },
      { teamId: TEAM_TWO, finishingPlacement: 1 },
      { teamId: TEAM_THREE, finishingPlacement: null },
    ]);
  });

  it("parses score-only submissions with blank placement", () => {
    expect(
      parseBulkFinishingPlacementsFromFormData(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "", scoreRelativeToPar: "-7" },
          { teamId: TEAM_TWO, placement: "", scoreTotalStrokes: "64" },
        ]),
      ),
    ).toEqual([
      {
        teamId: TEAM_ONE,
        finishingPlacement: null,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: undefined,
      },
      {
        teamId: TEAM_TWO,
        finishingPlacement: null,
        scoreRelativeToPar: undefined,
        scoreTotalStrokes: 64,
      },
    ]);
  });

  it("treats blank score fields as clears when fields are present", () => {
    const formData = bulkFormData([
      { teamId: TEAM_ONE, placement: "1" },
      { teamId: TEAM_TWO, placement: "" },
    ]);
    formData.set(`scoreRelativeToPar_${TEAM_ONE}`, "");
    formData.set(`scoreTotalStrokes_${TEAM_ONE}`, "");

    expect(parseBulkFinishingPlacementsFromFormData(formData)).toEqual([
      {
        teamId: TEAM_ONE,
        finishingPlacement: 1,
        scoreRelativeToPar: null,
        scoreTotalStrokes: null,
      },
      {
        teamId: TEAM_TWO,
        finishingPlacement: null,
      },
    ]);
  });

  it("rejects invalid strokes for the full submission", () => {
    expect(() =>
      parseBulkFinishingPlacementsFromFormData(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "1", scoreTotalStrokes: "0" },
          { teamId: TEAM_TWO, placement: "2" },
        ]),
      ),
    ).toThrow();
  });

  it("parses optional score fields when present", () => {
    const formData = bulkFormData([
      { teamId: TEAM_ONE, placement: "1" },
      { teamId: TEAM_TWO, placement: "" },
    ]);
    formData.set(`scoreRelativeToPar_${TEAM_ONE}`, "-7");
    formData.set(`scoreTotalStrokes_${TEAM_ONE}`, "64");
    formData.set(`scoreRelativeToPar_${TEAM_TWO}`, "0");

    expect(parseBulkFinishingPlacementsFromFormData(formData)).toEqual([
      {
        teamId: TEAM_ONE,
        finishingPlacement: 1,
        scoreRelativeToPar: -7,
        scoreTotalStrokes: 64,
      },
      {
        teamId: TEAM_TWO,
        finishingPlacement: null,
        scoreRelativeToPar: 0,
        scoreTotalStrokes: undefined,
      },
    ]);
  });

  it("accepts golf even notation for bulk relative-to-par fields", () => {
    expect(
      parseBulkFinishingPlacementsFromFormData(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "", scoreRelativeToPar: "E", scoreTotalStrokes: "67" },
          { teamId: TEAM_TWO, placement: "", scoreRelativeToPar: "e", scoreTotalStrokes: "68" },
        ]),
      ),
    ).toEqual([
      {
        teamId: TEAM_ONE,
        finishingPlacement: null,
        scoreRelativeToPar: 0,
        scoreTotalStrokes: 67,
      },
      {
        teamId: TEAM_TWO,
        finishingPlacement: null,
        scoreRelativeToPar: 0,
        scoreTotalStrokes: 68,
      },
    ]);
  });

  it("rejects invalid placement values for the full submission", () => {
    expect(() =>
      parseBulkFinishingPlacementsFromFormData(
        bulkFormData([
          { teamId: TEAM_ONE, placement: "2" },
          { teamId: TEAM_TWO, placement: "0" },
        ]),
      ),
    ).toThrow();
  });

  it("rejects malformed team ids", () => {
    expect(() =>
      parseBulkFinishingPlacementsFromFormData(
        bulkFormData([{ teamId: "not-a-uuid", placement: "1" }]),
      ),
    ).toThrow(ZodError);
  });

  it("deduplicates repeated team ids from duplicate form fields", () => {
    const formData = bulkFormData([
      { teamId: TEAM_ONE, placement: "1" },
      { teamId: TEAM_TWO, placement: "2" },
    ]);
    formData.append("teamIds", TEAM_ONE);
    formData.append("teamIds", TEAM_TWO);
    formData.set(`placement_${TEAM_ONE}`, "3");

    expect(parseBulkFinishingPlacementsFromFormData(formData)).toEqual([
      { teamId: TEAM_ONE, finishingPlacement: 3 },
      { teamId: TEAM_TWO, finishingPlacement: 2 },
    ]);
  });
});

describe("assertCompleteBulkTeamCoverage", () => {
  it("requires every tournament team to be included", () => {
    expect(() =>
      assertCompleteBulkTeamCoverage([TEAM_ONE, TEAM_TWO], [
        { teamId: TEAM_ONE, finishingPlacement: 1 },
      ]),
    ).toThrow(ServiceError);
  });

  it("rejects unknown and duplicate team ids", () => {
    expect(() =>
      assertCompleteBulkTeamCoverage([TEAM_ONE], [
        { teamId: TEAM_TWO, finishingPlacement: 1 },
      ]),
    ).toThrow(ServiceError);

    expect(() =>
      assertCompleteBulkTeamCoverage([TEAM_ONE], [
        { teamId: TEAM_ONE, finishingPlacement: 1 },
        { teamId: TEAM_ONE, finishingPlacement: 2 },
      ]),
    ).toThrow(ServiceError);
  });
});
