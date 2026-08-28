import { describe, expect, it } from "vitest";

import {
  ACTIVE_TOURNAMENT_SEED,
  ACTIVE_TOURNAMENT_SLUG,
} from "@/lib/db/active-tournament-seed";

describe("active tournament seed", () => {
  it("uses the expected bootstrap slug", () => {
    expect(ACTIVE_TOURNAMENT_SLUG).toBe("2026-rusty-wedge");
    expect(ACTIVE_TOURNAMENT_SEED.slug).toBe(ACTIVE_TOURNAMENT_SLUG);
  });

  it("seeds an active open-registration baseline", () => {
    expect(ACTIVE_TOURNAMENT_SEED.isActive).toBe(true);
    expect(ACTIVE_TOURNAMENT_SEED.registrationEnabled).toBe(true);
    expect(ACTIVE_TOURNAMENT_SEED.lifecycleStatus).toBe("registration_open");
  });
});
