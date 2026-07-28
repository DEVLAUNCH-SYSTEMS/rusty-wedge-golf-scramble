import { describe, expect, it } from "vitest";

import {
  ADMIN_ARCHIVED_READONLY_MESSAGE,
  adminArchivedReadOnlyReason,
} from "@/lib/content/admin-archived-readonly";

describe("adminArchivedReadOnlyReason", () => {
  it("returns the archived message only for archived tournaments", () => {
    expect(adminArchivedReadOnlyReason("archived")).toBe(
      ADMIN_ARCHIVED_READONLY_MESSAGE,
    );
    expect(adminArchivedReadOnlyReason("registration_open")).toBeUndefined();
  });
});
