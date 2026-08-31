import { describe, expect, it } from "vitest";

import { resolvePublicTeamsPageMode } from "@/lib/services/public-teams-page-mode";

describe("public teams page mode transitions", () => {
  it("returns results when results are published", () => {
    expect(
      resolvePublicTeamsPageMode({ teamsPublished: true, resultsPublished: true }),
    ).toBe("results");
  });

  it("returns roster when only teams are published", () => {
    expect(
      resolvePublicTeamsPageMode({ teamsPublished: true, resultsPublished: false }),
    ).toBe("roster");
  });

  it("returns unpublished when both flags are false", () => {
    expect(
      resolvePublicTeamsPageMode({ teamsPublished: false, resultsPublished: false }),
    ).toBe("not_published");
  });

  it("restores roster when results are hidden but teams remain published", () => {
    expect(
      resolvePublicTeamsPageMode({ teamsPublished: true, resultsPublished: false }),
    ).toBe("roster");
  });

  it("restores unpublished when results are hidden and teams are hidden", () => {
    expect(
      resolvePublicTeamsPageMode({ teamsPublished: false, resultsPublished: false }),
    ).toBe("not_published");
  });
});
