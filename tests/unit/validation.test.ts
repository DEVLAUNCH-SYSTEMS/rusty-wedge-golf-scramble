import { describe, expect, it } from "vitest";

import { FIELD_LIMITS } from "@/lib/validation/field-limits";
import {
  rejectRegistrationSchema,
  submitRegistrationSchema,
} from "@/lib/validation/forms";

describe("validation max lengths", () => {
  it("rejects over-limit registration fields", () => {
    const result = submitRegistrationSchema.safeParse({
      firstName: "a".repeat(FIELD_LIMITS.firstName + 1),
      lastName: "Player",
      email: "player@example.com",
      phone: "5095550100",
      skillLevel: "B",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid registration input", () => {
    const result = submitRegistrationSchema.safeParse({
      firstName: "Pat",
      lastName: "Player",
      email: "player@example.com",
      phone: "5095550100",
      skillLevel: "C",
      notes: "Optional note",
    });

    expect(result.success).toBe(true);
  });

  it("requires rejection reason within limit", () => {
    expect(
      rejectRegistrationSchema.safeParse({
        reason: "a".repeat(FIELD_LIMITS.rejectionReason + 1),
      }).success,
    ).toBe(false);
  });
});
