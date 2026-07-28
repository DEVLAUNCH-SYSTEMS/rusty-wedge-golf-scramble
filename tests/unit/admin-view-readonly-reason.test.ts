import { describe, expect, it } from "vitest";

import {
  ADMIN_ARCHIVED_READONLY_MESSAGE,
  ADMIN_NON_ACTIVE_VIEW_MESSAGE,
  adminViewReadOnlyReason,
} from "@/lib/content/admin-archived-readonly";

describe("adminViewReadOnlyReason", () => {
  it("returns archived message for archived tournaments", () => {
    expect(adminViewReadOnlyReason("archived", true)).toBe(
      ADMIN_ARCHIVED_READONLY_MESSAGE,
    );
    expect(adminViewReadOnlyReason("archived", false)).toBe(
      ADMIN_ARCHIVED_READONLY_MESSAGE,
    );
  });

  it("returns non-active view message when not viewing the public active tournament", () => {
    expect(adminViewReadOnlyReason("draft", false)).toBe(
      ADMIN_NON_ACTIVE_VIEW_MESSAGE,
    );
    expect(adminViewReadOnlyReason("registration_closed", false)).toBe(
      ADMIN_NON_ACTIVE_VIEW_MESSAGE,
    );
  });

  it("returns undefined when viewing the active non-archived tournament", () => {
    expect(adminViewReadOnlyReason("registration_open", true)).toBeUndefined();
    expect(adminViewReadOnlyReason("draft", true)).toBeUndefined();
  });
});
