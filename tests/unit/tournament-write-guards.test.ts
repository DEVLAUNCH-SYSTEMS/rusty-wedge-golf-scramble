import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import {
  assertTournamentScope,
  assertTournamentWritable,
} from "@/lib/services/tournament";

describe("tournament write guards", () => {
  it("rejects cross-tournament scope", () => {
    expect(() =>
      assertTournamentScope("reg-tournament", "active-tournament"),
    ).toThrow(ServiceError);

    try {
      assertTournamentScope("reg-tournament", "active-tournament");
    } catch (error) {
      expect(error).toMatchObject({ code: "TOURNAMENT_SCOPE_MISMATCH" });
    }
  });

  it("allows matching tournament scope", () => {
    expect(() => assertTournamentScope("same-id", "same-id")).not.toThrow();
  });

  it("rejects archived tournament writes", () => {
    expect(() =>
      assertTournamentWritable({ lifecycleStatus: "archived" }),
    ).toThrow(ServiceError);

    try {
      assertTournamentWritable({ lifecycleStatus: "archived" });
    } catch (error) {
      expect(error).toMatchObject({ code: "TOURNAMENT_ARCHIVED" });
    }
  });

  it("allows non-archived lifecycle writes", () => {
    for (const lifecycleStatus of [
      "draft",
      "registration_open",
      "registration_closed",
      "completed",
    ] as const) {
      expect(() => assertTournamentWritable({ lifecycleStatus })).not.toThrow();
    }
  });
});
