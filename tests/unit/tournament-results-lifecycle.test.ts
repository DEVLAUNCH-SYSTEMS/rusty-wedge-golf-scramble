import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import {
  allowsFinishingPlacementMutation,
  assertFinishingPlacementMutationAllowed,
} from "@/lib/services/tournament-results-lifecycle";

describe("allowsFinishingPlacementMutation", () => {
  it("allows active registration_closed and completed tournaments", () => {
    expect(
      allowsFinishingPlacementMutation({
        lifecycleStatus: "registration_closed",
        isViewingActiveTournament: true,
      }),
    ).toBe(true);

    expect(
      allowsFinishingPlacementMutation({
        lifecycleStatus: "completed",
        isViewingActiveTournament: true,
      }),
    ).toBe(true);
  });

  it("blocks registration_open", () => {
    expect(
      allowsFinishingPlacementMutation({
        lifecycleStatus: "registration_open",
        isViewingActiveTournament: true,
      }),
    ).toBe(false);
  });

  it("blocks non-active tournament views", () => {
    expect(
      allowsFinishingPlacementMutation({
        lifecycleStatus: "completed",
        isViewingActiveTournament: false,
      }),
    ).toBe(false);
  });

  it("blocks archived tournaments", () => {
    expect(
      allowsFinishingPlacementMutation({
        lifecycleStatus: "archived",
        isViewingActiveTournament: true,
      }),
    ).toBe(false);
  });
});

describe("assertFinishingPlacementMutationAllowed", () => {
  it("throws TOURNAMENT_NOT_ACTIVE for non-active views", () => {
    expect(() =>
      assertFinishingPlacementMutationAllowed({
        lifecycleStatus: "completed",
        isViewingActiveTournament: false,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "TOURNAMENT_NOT_ACTIVE",
      } satisfies Partial<ServiceError>),
    );
  });

  it("throws FINISHING_PLACEMENT_NOT_ALLOWED during open registration", () => {
    expect(() =>
      assertFinishingPlacementMutationAllowed({
        lifecycleStatus: "registration_open",
        isViewingActiveTournament: true,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "FINISHING_PLACEMENT_NOT_ALLOWED",
      } satisfies Partial<ServiceError>),
    );
  });
});
