import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import { assertLifecycleTransitionConfirm } from "@/lib/services/tournament-lifecycle-confirm";

describe("assertLifecycleTransitionConfirm", () => {
  it("requires matching year to archive", () => {
    expect(() =>
      assertLifecycleTransitionConfirm({
        fromStatus: "completed",
        toStatus: "archived",
        tournamentYear: 2026,
        confirmYear: "2025",
        confirmAcknowledged: "",
      }),
    ).toThrow(ServiceError);
  });

  it("accepts matching year to archive", () => {
    expect(() =>
      assertLifecycleTransitionConfirm({
        fromStatus: "completed",
        toStatus: "archived",
        tournamentYear: 2026,
        confirmYear: "2026",
        confirmAcknowledged: "",
      }),
    ).not.toThrow();
  });

  it("requires acknowledge for close registration", () => {
    expect(() =>
      assertLifecycleTransitionConfirm({
        fromStatus: "registration_open",
        toStatus: "registration_closed",
        tournamentYear: 2026,
        confirmYear: "",
        confirmAcknowledged: "",
      }),
    ).toThrow(ServiceError);
  });

  it("allows open registration from draft without acknowledge", () => {
    expect(() =>
      assertLifecycleTransitionConfirm({
        fromStatus: "draft",
        toStatus: "registration_open",
        tournamentYear: 2026,
        confirmYear: "",
        confirmAcknowledged: "",
      }),
    ).not.toThrow();
  });
});
