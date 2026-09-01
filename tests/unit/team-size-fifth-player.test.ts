import { describe, expect, it } from "vitest";

import { FORMAT_SECTION } from "@/lib/content/landing-content";
import {
  MAX_TEAM_SIZE,
  STANDARD_FOURSOME_SIZE,
  TEAM_FULL_ERROR_MESSAGE,
} from "@/lib/domain/team-size";
import {
  computeTeamSlotsRemaining,
  formatAdminTeamDetailCapacity,
  formatAdminTeamMemberCapacity,
} from "@/lib/format/admin-team-capacity-display";
import { formatPublicTeamResultsScoreLine } from "@/lib/format/public-team-results-score-display";
import {
  buildPublicTeamRosterSlots,
  formatPublicTeamPlayerCount,
  PUBLIC_TEAM_EMPTY_SLOT_LABEL,
  PUBLIC_TEAM_ROSTER_SLOT_COUNT,
  resolvePublicTeamRosterSlotCount,
} from "@/lib/format/public-team-roster-slots";

import { assertPublicTeamViewPrivacy } from "../helpers/public-team-privacy";

const fivePlayers = [
  { firstName: "Amy", lastName: "Smith" },
  { firstName: "Bo", lastName: "Jones" },
  { firstName: "Cal", lastName: "Lee" },
  { firstName: "Dee", lastName: "Park" },
  { firstName: "Eli", lastName: "Nguyen" },
];

describe("team size domain", () => {
  it("defines standard foursome and exceptional maximum separately", () => {
    expect(STANDARD_FOURSOME_SIZE).toBe(4);
    expect(MAX_TEAM_SIZE).toBe(5);
    expect(TEAM_FULL_ERROR_MESSAGE).toContain("five");
  });

  it("computes slots remaining from the application maximum", () => {
    expect(computeTeamSlotsRemaining(4)).toBe(1);
    expect(computeTeamSlotsRemaining(5)).toBe(0);
  });
});

describe("admin team capacity presentation", () => {
  it("shows assignable capacity using the application maximum", () => {
    expect(formatAdminTeamMemberCapacity(4)).toBe("4 / 5");
    expect(formatAdminTeamDetailCapacity({ memberCount: 5, slotsRemaining: 0 })).toBe(
      "5 of 5 players assigned · 0 open slots",
    );
  });
});

describe("resolvePublicTeamRosterSlotCount", () => {
  it("uses four slots for teams with fewer than five members", () => {
    expect(resolvePublicTeamRosterSlotCount(0)).toBe(4);
    expect(resolvePublicTeamRosterSlotCount(3)).toBe(4);
    expect(resolvePublicTeamRosterSlotCount(4)).toBe(4);
  });

  it("uses five slots when a team has five members", () => {
    expect(resolvePublicTeamRosterSlotCount(5)).toBe(5);
  });
});

describe("public team roster slots", () => {
  it("preserves four-slot foursome presentation for teams with fewer than five players", () => {
    expect(buildPublicTeamRosterSlots([])).toHaveLength(PUBLIC_TEAM_ROSTER_SLOT_COUNT);
    expect(
      buildPublicTeamRosterSlots([
        { firstName: "Amy", lastName: "Smith" },
        { firstName: "Bo", lastName: "Jones" },
      ]),
    ).toHaveLength(PUBLIC_TEAM_ROSTER_SLOT_COUNT);
  });

  it("renders all five players without a sixth placeholder", () => {
    const slots = buildPublicTeamRosterSlots(fivePlayers);

    expect(slots).toHaveLength(5);
    expect(slots.every((slot) => !slot.isEmpty)).toBe(true);
    expect(slots.map((slot) => slot.label)).toEqual([
      "Amy Smith",
      "Bo Jones",
      "Cal Lee",
      "Dee Park",
      "Eli Nguyen",
    ]);
  });

  it("fills open foursome slots with em dash placeholders", () => {
    const slots = buildPublicTeamRosterSlots([{ firstName: "Amy", lastName: "Smith" }]);

    expect(slots[0]).toEqual({ label: "Amy Smith", isEmpty: false });
    expect(slots.slice(1).every((slot) => slot.isEmpty && slot.label === PUBLIC_TEAM_EMPTY_SLOT_LABEL)).toBe(
      true,
    );
  });

  it("formats player counts for card headers", () => {
    expect(formatPublicTeamPlayerCount(5)).toBe("5 players");
  });
});

describe("five-player results compatibility", () => {
  it("preserves placement and score formatting for five-player teams", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 8,
      finishingPlacement: 1,
      scoreRelativeToPar: -7,
      scoreTotalStrokes: 64,
      players: fivePlayers,
    });

    expect(formatPublicTeamResultsScoreLine(-7, 64)).toBe("-7 / 64");
    expect(buildPublicTeamRosterSlots(fivePlayers)).toHaveLength(5);
  });
});

describe("standard foursome marketing copy", () => {
  it("remains unchanged", () => {
    expect(FORMAT_SECTION.features[0]).toEqual({
      title: "4 Players",
      subtitle: "Per Team",
    });
    expect(FORMAT_SECTION.titleBefore).toBe("4-Person Best Ball ");
  });
});
