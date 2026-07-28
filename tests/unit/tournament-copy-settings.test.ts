import { describe, expect, it } from "vitest";

import {
  buildCreateInputFromPriorTournament,
  buildNameForYear,
  buildSlugForYear,
  pickCopiedTournamentConfig,
} from "@/lib/services/tournament-copy-settings";

import type { Tournament } from "@/lib/services/tournament";

function sourceTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "source-id",
    name: "The Rusty Wedge Golf Scramble 2026",
    slug: "2026-rusty-wedge",
    year: 2026,
    eventDate: "2026-08-28",
    teeTime: "09:00:00",
    locationName: "Deer Park Golf Course",
    entryFeeCents: 9000,
    confirmedCapacityLimit: 72,
    venmoHandle: "@scottyrusty",
    registrationEnabled: true,
    isActive: true,
    lifecycleStatus: "registration_open",
    registrationOpensAt: new Date("2026-01-01T00:00:00.000Z"),
    registrationClosesAt: new Date("2026-08-01T00:00:00.000Z"),
    archivedAt: null,
    archivedByAdminId: null,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("tournament copy settings builders", () => {
  it("builds next-year slug from year-prefixed source slug", () => {
    expect(buildSlugForYear("2026-rusty-wedge", 2026, 2027)).toBe(
      "2027-rusty-wedge",
    );
  });

  it("prefixes slug when source slug does not include the source year", () => {
    expect(buildSlugForYear("rusty-wedge", 2026, 2027)).toBe(
      "2027-rusty-wedge",
    );
  });

  it("replaces year in name when present", () => {
    expect(
      buildNameForYear("The Rusty Wedge Golf Scramble 2026", 2026, 2027),
    ).toBe("The Rusty Wedge Golf Scramble 2027");
  });

  it("keeps name unchanged when it does not include the source year", () => {
    expect(buildNameForYear("The Rusty Wedge Golf Scramble", 2026, 2027)).toBe(
      "The Rusty Wedge Golf Scramble",
    );
  });

  it("copies config fields only from the source tournament row", () => {
    expect(pickCopiedTournamentConfig(sourceTournament())).toEqual({
      locationName: "Deer Park Golf Course",
      entryFeeCents: 9000,
      confirmedCapacityLimit: 72,
      venmoHandle: "@scottyrusty",
      teeTime: "09:00:00",
    });
  });

  it("builds create input with copied config and draft defaults", () => {
    expect(
      buildCreateInputFromPriorTournament(sourceTournament(), {
        year: 2027,
        eventDate: "2027-08-28",
      }),
    ).toEqual({
      name: "The Rusty Wedge Golf Scramble 2027",
      slug: "2027-rusty-wedge",
      year: 2027,
      eventDate: "2027-08-28",
      teeTime: "09:00:00",
      locationName: "Deer Park Golf Course",
      entryFeeCents: 9000,
      confirmedCapacityLimit: 72,
      venmoHandle: "@scottyrusty",
      lifecycleStatus: "draft",
      registrationOpensAt: null,
      registrationClosesAt: null,
    });
  });

  it("does not carry over active, lifecycle, or archive state from source", () => {
    const input = buildCreateInputFromPriorTournament(sourceTournament(), {
      year: 2027,
      eventDate: "2027-08-28",
    });

    expect(input).not.toHaveProperty("isActive");
    expect(input).not.toHaveProperty("archivedAt");
    expect(input.lifecycleStatus).toBe("draft");
    expect(input.registrationOpensAt).toBeNull();
    expect(input.registrationClosesAt).toBeNull();
  });
});
