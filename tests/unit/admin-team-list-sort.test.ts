import { describe, expect, it } from "vitest";

import { parseAdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

describe("parseAdminTeamListSort", () => {
  it("defaults to ascending team number order", () => {
    expect(parseAdminTeamListSort(undefined)).toBe("asc");
    expect(parseAdminTeamListSort("asc")).toBe("asc");
    expect(parseAdminTeamListSort("invalid")).toBe("asc");
  });

  it("accepts explicit descending order", () => {
    expect(parseAdminTeamListSort("desc")).toBe("desc");
  });
});
