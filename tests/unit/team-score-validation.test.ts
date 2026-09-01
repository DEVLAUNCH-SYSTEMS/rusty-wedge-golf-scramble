import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import {
  formatScoreRelativeToParFieldValue,
  parseOptionalScoreRelativeToParField,
  parseOptionalScoreTotalStrokesField,
  parseScoreRelativeToParFieldString,
  parseTeamScoreRelativeToParInput,
  parseTeamScoreTotalStrokesInput,
} from "@/lib/validation/team-score";

describe("parseTeamScoreRelativeToParInput", () => {
  it("accepts signed integers including zero", () => {
    expect(parseTeamScoreRelativeToParInput(-7)).toBe(-7);
    expect(parseTeamScoreRelativeToParInput(0)).toBe(0);
    expect(parseTeamScoreRelativeToParInput(2)).toBe(2);
  });

  it("rejects non-integers", () => {
    expect(() => parseTeamScoreRelativeToParInput(1.5)).toThrow();
  });
});

describe("parseTeamScoreTotalStrokesInput", () => {
  it("accepts positive integers", () => {
    expect(parseTeamScoreTotalStrokesInput(64)).toBe(64);
    expect(parseTeamScoreTotalStrokesInput(1)).toBe(1);
  });

  it("rejects zero and negative values", () => {
    expect(() => parseTeamScoreTotalStrokesInput(0)).toThrow();
    expect(() => parseTeamScoreTotalStrokesInput(-1)).toThrow();
  });
});

describe("parseOptionalScoreRelativeToParField", () => {
  it("returns undefined when the field is omitted", () => {
    expect(parseOptionalScoreRelativeToParField(undefined)).toBeUndefined();
  });

  it("returns null for blank values", () => {
    expect(parseOptionalScoreRelativeToParField(null)).toBeNull();
    expect(parseOptionalScoreRelativeToParField("")).toBeNull();
    expect(parseOptionalScoreRelativeToParField("   ")).toBeNull();
  });

  it("parses signed integers", () => {
    expect(parseOptionalScoreRelativeToParField("-7")).toBe(-7);
    expect(parseOptionalScoreRelativeToParField("0")).toBe(0);
    expect(parseOptionalScoreRelativeToParField("+2")).toBe(2);
    expect(parseOptionalScoreRelativeToParField("2")).toBe(2);
  });

  it("accepts golf even notation", () => {
    expect(parseOptionalScoreRelativeToParField("E")).toBe(0);
    expect(parseOptionalScoreRelativeToParField("e")).toBe(0);
  });

  it("rejects invalid values", () => {
    expect(() => parseOptionalScoreRelativeToParField("abc")).toThrow(ServiceError);
    expect(() => parseOptionalScoreRelativeToParField("E7")).toThrow(ServiceError);
  });
});

describe("parseScoreRelativeToParFieldString", () => {
  it("normalizes golf even notation to zero", () => {
    expect(parseScoreRelativeToParFieldString("E")).toBe(0);
    expect(parseScoreRelativeToParFieldString("e")).toBe(0);
  });

  it("normalizes numeric golf notation", () => {
    expect(parseScoreRelativeToParFieldString("-8")).toBe(-8);
    expect(parseScoreRelativeToParFieldString("0")).toBe(0);
    expect(parseScoreRelativeToParFieldString("+2")).toBe(2);
    expect(parseScoreRelativeToParFieldString("2")).toBe(2);
  });

  it("rejects invalid non-golf text", () => {
    expect(() => parseScoreRelativeToParFieldString("abc")).toThrow(ServiceError);
  });
});

describe("formatScoreRelativeToParFieldValue", () => {
  it("renders even par as E", () => {
    expect(formatScoreRelativeToParFieldValue(0)).toBe("E");
  });

  it("renders signed integers for non-zero values", () => {
    expect(formatScoreRelativeToParFieldValue(-8)).toBe("-8");
    expect(formatScoreRelativeToParFieldValue(2)).toBe("2");
  });

  it("renders blank for null", () => {
    expect(formatScoreRelativeToParFieldValue(null)).toBe("");
  });
});

describe("parseOptionalScoreTotalStrokesField", () => {
  it("returns undefined when the field is omitted", () => {
    expect(parseOptionalScoreTotalStrokesField(undefined)).toBeUndefined();
  });

  it("returns null for blank values", () => {
    expect(parseOptionalScoreTotalStrokesField("")).toBeNull();
  });

  it("rejects non-positive values", () => {
    expect(() => parseOptionalScoreTotalStrokesField("0")).toThrow();
    expect(() => parseOptionalScoreTotalStrokesField("-3")).toThrow();
  });
});
