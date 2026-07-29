import { describe, expect, it } from "vitest";

import { FIELD_LIMITS } from "@/lib/validation/field-limits";
import {
  rejectRegistrationSchema,
  submitRegistrationSchema,
  updateRegistrationProfileSchema,
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

describe("updateRegistrationProfileSchema", () => {
  it("reuses public profile rules and lowercases email", () => {
    const result = updateRegistrationProfileSchema.safeParse({
      firstName: " Pat ",
      lastName: " Player ",
      email: "Pat.Player@Example.COM",
      phone: "5095550100",
      skillLevel: "A",
      preferredPlayers: " Jamie ",
      notes: " Left tee ",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      firstName: "Pat",
      lastName: "Player",
      email: "pat.player@example.com",
      phone: "5095550100",
      skillLevel: "A",
      preferredPlayers: "Jamie",
      notes: "Left tee",
    });
  });

  it("rejects invalid admin profile updates", () => {
    expect(
      updateRegistrationProfileSchema.safeParse({
        firstName: "",
        lastName: "Player",
        email: "not-an-email",
        phone: "123",
        skillLevel: "Z",
      }).success,
    ).toBe(false);
  });
});
