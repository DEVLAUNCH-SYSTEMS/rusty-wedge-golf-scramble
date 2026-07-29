import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { parseCreateTournamentFormData } from "@/lib/actions/parse-tournament-create-form";

function createFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("year", "2028");
  formData.set("name", "The Rusty Wedge Golf Scramble");
  formData.set("slug", "2028-rusty-wedge");
  formData.set("eventDate", "2028-08-28");
  formData.set("teeTime", "09:00");
  formData.set("locationName", "Deer Park Golf Course");
  formData.set("entryFeeDollars", "85.00");
  formData.set("confirmedCapacityLimit", "68");
  formData.set("venmoHandle", "@scottyrusty");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("parseCreateTournamentFormData", () => {
  it("parses tournament create fields into a draft create input", () => {
    expect(parseCreateTournamentFormData(createFormData())).toEqual({
      name: "The Rusty Wedge Golf Scramble",
      slug: "2028-rusty-wedge",
      year: 2028,
      eventDate: "2028-08-28",
      teeTime: "09:00",
      locationName: "Deer Park Golf Course",
      entryFeeCents: 8500,
      confirmedCapacityLimit: 68,
      venmoHandle: "@scottyrusty",
      lifecycleStatus: "draft",
    });
  });

  it("converts dollar entry fees to cents", () => {
    expect(
      parseCreateTournamentFormData(createFormData({ entryFeeDollars: "$99.50" }))
        .entryFeeCents,
    ).toBe(9950);
  });

  it("rejects slug and year mismatches", () => {
    expect(() =>
      parseCreateTournamentFormData(
        createFormData({ slug: "2029-rusty-wedge" }),
      ),
    ).toThrow(ZodError);
  });
});
