import { describe, expect, it } from "vitest";

import { buildLifecycleActions } from "@/lib/content/tournament-lifecycle-actions";

describe("buildLifecycleActions", () => {
  it("maps draft to open registration without acknowledge", () => {
    const actions = buildLifecycleActions("draft");

    expect(actions).toEqual([
      expect.objectContaining({
        toStatus: "registration_open",
        label: "Open registration",
        requiresAcknowledge: false,
        requiresYearConfirm: false,
      }),
    ]);
  });

  it("maps registration_closed to reopen and complete actions", () => {
    const actions = buildLifecycleActions("registration_closed");

    expect(actions.map((action) => action.label)).toEqual([
      "Reopen registration",
      "Mark completed",
    ]);
    expect(actions[0]?.requiresAcknowledge).toBe(true);
    expect(actions[1]?.requiresAcknowledge).toBe(true);
  });

  it("requires year confirmation for archive", () => {
    const actions = buildLifecycleActions("completed");

    expect(actions).toEqual([
      expect.objectContaining({
        toStatus: "archived",
        label: "Archive tournament",
        requiresYearConfirm: true,
        danger: true,
      }),
    ]);
  });

  it("maps archived restore to completed with acknowledge", () => {
    const actions = buildLifecycleActions("archived");

    expect(actions).toEqual([
      expect.objectContaining({
        toStatus: "completed",
        label: "Restore from archive",
        requiresAcknowledge: true,
      }),
    ]);
  });
});
