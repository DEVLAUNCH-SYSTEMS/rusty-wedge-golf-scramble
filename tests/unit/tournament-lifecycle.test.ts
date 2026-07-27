import { describe, expect, it } from "vitest";

import {
  allowsAdminMutations,
  allowsPublicRegistration,
  isLifecycleArchived,
  isLifecycleDraft,
  isLifecycleRegistrationOpen,
  registrationEnabledFromLifecycle,
} from "@/lib/services/tournament-lifecycle";

describe("tournament lifecycle helpers", () => {
  it("treats registration_open as the only public-registration status", () => {
    expect(allowsPublicRegistration("registration_open")).toBe(true);
    expect(isLifecycleRegistrationOpen("registration_open")).toBe(true);

    for (const status of [
      "draft",
      "registration_closed",
      "completed",
      "archived",
    ] as const) {
      expect(allowsPublicRegistration(status)).toBe(false);
      expect(isLifecycleRegistrationOpen(status)).toBe(false);
    }
  });

  it("blocks admin mutations only when archived", () => {
    expect(allowsAdminMutations("archived")).toBe(false);
    expect(isLifecycleArchived("archived")).toBe(true);

    for (const status of [
      "draft",
      "registration_open",
      "registration_closed",
      "completed",
    ] as const) {
      expect(allowsAdminMutations(status)).toBe(true);
      expect(isLifecycleArchived(status)).toBe(false);
    }
  });

  it("derives registration_enabled from lifecycle", () => {
    expect(registrationEnabledFromLifecycle("registration_open")).toBe(true);
    expect(registrationEnabledFromLifecycle("draft")).toBe(false);
    expect(registrationEnabledFromLifecycle("archived")).toBe(false);
    expect(isLifecycleDraft("draft")).toBe(true);
  });
});
