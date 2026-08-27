import { describe, expect, it } from "vitest";

import { formatAdminTeamLabel } from "@/lib/format/team-display";
import {
  formatTeamRosterMemberName,
  formatTeamRosterPreview,
  hasTeamRosterPreview,
} from "@/lib/format/team-roster-display";

describe("team roster preview formatting", () => {
  it("formats member names as First Last", () => {
    expect(formatTeamRosterMemberName({ firstName: "Amy", lastName: "Smith" })).toBe(
      "Amy Smith",
    );
  });

  it("joins assigned players for compact roster preview", () => {
    expect(
      formatTeamRosterPreview([
        { firstName: "Amy", lastName: "Smith" },
        { firstName: "Bo", lastName: "Jones" },
      ]),
    ).toBe("Amy Smith · Bo Jones");
  });

  it("treats empty rosters as no preview line", () => {
    expect(formatTeamRosterPreview([])).toBe("");
    expect(hasTeamRosterPreview([])).toBe(false);
  });
});

describe("team list label with roster data", () => {
  it("uses teamNumber for primary identity independent of legacy name", () => {
    expect(formatAdminTeamLabel({ teamNumber: 10, name: "Team #2 legacy" })).toBe("Team #10");
  });
});
