import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { createTournamentSchema } from "@/lib/validation/tournament-create";

const validInput = {
  name: "The Rusty Wedge Golf Scramble",
  slug: "2027-rusty-wedge",
  year: 2027,
  eventDate: "2027-08-28",
  teeTime: "09:00",
  locationName: "Deer Park Golf Course",
  entryFeeCents: 8500,
  confirmedCapacityLimit: 68,
  venmoHandle: "@scottyrusty",
};

describe("createTournamentSchema", () => {
  it("accepts a valid draft tournament payload with defaults", () => {
    expect(createTournamentSchema.parse(validInput)).toEqual({
      ...validInput,
      teeTime: "09:00",
      lifecycleStatus: "draft",
    });
  });

  it("lowercases slug before validation", () => {
    expect(
      createTournamentSchema.parse({
        ...validInput,
        slug: "2027-Rusty-Wedge",
      }).slug,
    ).toBe("2027-rusty-wedge");
  });

  it("rejects archived lifecycle status on create", () => {
    expect(() =>
      createTournamentSchema.parse({
        ...validInput,
        lifecycleStatus: "archived",
      }),
    ).toThrow(ZodError);
  });

  it("rejects slug that does not start with year", () => {
    expect(() =>
      createTournamentSchema.parse({
        ...validInput,
        slug: "2028-rusty-wedge",
      }),
    ).toThrow(ZodError);
  });

  it("rejects invalid slug characters", () => {
    expect(() =>
      createTournamentSchema.parse({
        ...validInput,
        slug: "2027_rusty_wedge",
      }),
    ).toThrow(ZodError);
  });

  it("rejects venmo handle without @ prefix", () => {
    expect(() =>
      createTournamentSchema.parse({
        ...validInput,
        venmoHandle: "scottyrusty",
      }),
    ).toThrow(ZodError);
  });

  it("accepts creatable lifecycle statuses", () => {
    expect(
      createTournamentSchema.parse({
        ...validInput,
        lifecycleStatus: "registration_open",
      }).lifecycleStatus,
    ).toBe("registration_open");
  });
});
