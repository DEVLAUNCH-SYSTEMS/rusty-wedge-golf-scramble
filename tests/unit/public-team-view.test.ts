import { describe, expect, it } from "vitest";

import { PUBLIC_TEAMS_NOT_PUBLISHED_MESSAGE } from "@/lib/content/public-teams-copy";
import {
  buildPublicTeamRosterSlots,
  formatPublicTeamPlayerCount,
  PUBLIC_TEAM_EMPTY_SLOT_LABEL,
  PUBLIC_TEAM_ROSTER_SLOT_COUNT,
} from "@/lib/format/public-team-roster-slots";
import { formatPublicTeamLabel } from "@/lib/format/team-display";
import { formatTeamRosterMemberName } from "@/lib/format/team-roster-display";

import { assertPublicTeamViewPrivacy } from "../helpers/public-team-privacy";

describe("public team view formatting", () => {
  it("uses Team #N for public identity", () => {
    expect(formatPublicTeamLabel(10)).toBe("Team #10");
  });

  it("renders roster names as First Last", () => {
    expect(formatTeamRosterMemberName({ firstName: "Amy", lastName: "Smith" })).toBe(
      "Amy Smith",
    );
  });

  it("limits public DTO fields to teamNumber and player names", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 2,
      players: [{ firstName: "Amy", lastName: "Smith" }],
    });
  });

  it("allows empty player rosters in the public DTO", () => {
    assertPublicTeamViewPrivacy({
      teamNumber: 3,
      players: [],
    });
  });
});

describe("public team roster slots", () => {
  it("reserves exactly four roster rows", () => {
    expect(buildPublicTeamRosterSlots([])).toHaveLength(PUBLIC_TEAM_ROSTER_SLOT_COUNT);
    expect(
      buildPublicTeamRosterSlots([
        { firstName: "Amy", lastName: "Smith" },
        { firstName: "Bo", lastName: "Jones" },
        { firstName: "Cal", lastName: "Lee" },
        { firstName: "Dee", lastName: "Park" },
      ]),
    ).toHaveLength(PUBLIC_TEAM_ROSTER_SLOT_COUNT);
  });

  it("fills open slots with em dash placeholders", () => {
    const slots = buildPublicTeamRosterSlots([{ firstName: "Amy", lastName: "Smith" }]);

    expect(slots[0]).toEqual({ label: "Amy Smith", isEmpty: false });
    expect(slots.slice(1).every((slot) => slot.isEmpty && slot.label === PUBLIC_TEAM_EMPTY_SLOT_LABEL)).toBe(
      true,
    );
  });

  it("formats player counts for card headers", () => {
    expect(formatPublicTeamPlayerCount(0)).toBe("0 players");
    expect(formatPublicTeamPlayerCount(1)).toBe("1 player");
    expect(formatPublicTeamPlayerCount(4)).toBe("4 players");
  });

  it("renders five roster rows when a team has five members", () => {
    const slots = buildPublicTeamRosterSlots([
      { firstName: "Amy", lastName: "Smith" },
      { firstName: "Bo", lastName: "Jones" },
      { firstName: "Cal", lastName: "Lee" },
      { firstName: "Dee", lastName: "Park" },
      { firstName: "Eli", lastName: "Nguyen" },
    ]);

    expect(slots).toHaveLength(5);
    expect(slots.every((slot) => !slot.isEmpty)).toBe(true);
  });
});

describe("public teams unavailable copy", () => {
  it("uses the approved unpublished message", () => {
    expect(PUBLIC_TEAMS_NOT_PUBLISHED_MESSAGE).toBe(
      "Teams have not been published yet.",
    );
  });
});
