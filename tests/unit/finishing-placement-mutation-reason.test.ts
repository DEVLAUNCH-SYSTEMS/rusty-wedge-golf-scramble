import { describe, expect, it } from "vitest";

import {
  ADMIN_ARCHIVED_READONLY_MESSAGE,
  ADMIN_NON_ACTIVE_VIEW_MESSAGE,
} from "@/lib/content/admin-archived-readonly";
import {
  FINISHING_PLACEMENT_REGISTRATION_OPEN_MESSAGE,
  resolveFinishingPlacementMutationReason,
} from "@/lib/content/finishing-placement-mutation-reason";

describe("resolveFinishingPlacementMutationReason", () => {
  it("allows active registration_closed and completed tournaments", () => {
    expect(
      resolveFinishingPlacementMutationReason({
        lifecycleStatus: "registration_closed",
        isViewingActiveTournament: true,
      }),
    ).toBeUndefined();

    expect(
      resolveFinishingPlacementMutationReason({
        lifecycleStatus: "completed",
        isViewingActiveTournament: true,
      }),
    ).toBeUndefined();
  });

  it("blocks registration_open on the active tournament", () => {
    expect(
      resolveFinishingPlacementMutationReason({
        lifecycleStatus: "registration_open",
        isViewingActiveTournament: true,
      }),
    ).toBe(FINISHING_PLACEMENT_REGISTRATION_OPEN_MESSAGE);
  });

  it("blocks non-active tournament views", () => {
    expect(
      resolveFinishingPlacementMutationReason({
        lifecycleStatus: "completed",
        isViewingActiveTournament: false,
      }),
    ).toBe(ADMIN_NON_ACTIVE_VIEW_MESSAGE);
  });

  it("blocks archived tournaments", () => {
    expect(
      resolveFinishingPlacementMutationReason({
        lifecycleStatus: "archived",
        isViewingActiveTournament: true,
      }),
    ).toBe(ADMIN_ARCHIVED_READONLY_MESSAGE);
  });
});
