import { describe, expect, it } from "vitest";

import { resolvePublicTeamsPageMode } from "@/lib/services/public-teams-page-mode";

describe("resolvePublicTeamsPageMode", () => {
  it("returns not_published when tournament is missing", () => {
    expect(resolvePublicTeamsPageMode(null)).toBe("not_published");
    expect(resolvePublicTeamsPageMode(undefined)).toBe("not_published");
  });

  it("returns not_published when neither flag is set", () => {
    expect(
      resolvePublicTeamsPageMode({
        teamsPublished: false,
        resultsPublished: false,
      }),
    ).toBe("not_published");
  });

  it("returns roster when only teams are published", () => {
    expect(
      resolvePublicTeamsPageMode({
        teamsPublished: true,
        resultsPublished: false,
      }),
    ).toBe("roster");
  });

  it("returns results when results are published", () => {
    expect(
      resolvePublicTeamsPageMode({
        teamsPublished: false,
        resultsPublished: true,
      }),
    ).toBe("results");
  });

  it("prefers results over roster when both flags are set", () => {
    expect(
      resolvePublicTeamsPageMode({
        teamsPublished: true,
        resultsPublished: true,
      }),
    ).toBe("results");
  });
});
