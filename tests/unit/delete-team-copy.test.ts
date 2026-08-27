import { describe, expect, it } from "vitest";

import {
  deleteTeamAcknowledgementCopy,
  deleteTeamDescription,
} from "@/lib/content/delete-team-copy";

describe("delete team copy", () => {
  it("uses shorter empty-team messaging", () => {
    expect(deleteTeamDescription("Audit Team", 0)).toBe(
      "Delete Audit Team? This team has no assigned players.",
    );
    expect(deleteTeamAcknowledgementCopy(0)).toBe(
      "I understand that this empty team will be permanently deleted.",
    );
  });

  it("states unassign and registration preservation for populated teams", () => {
    expect(deleteTeamDescription("Team #2", 3)).toBe(
      "Delete Team #2? Its 3 assigned players will become unassigned. Registrations are preserved.",
    );
    expect(deleteTeamAcknowledgementCopy(2)).toBe(
      "I understand that deleting this team will unassign its assigned players and preserve their registrations.",
    );
  });
});
