import { describe, expect, it } from "vitest";

import { parseUpdateRegistrationProfileFormData } from "@/lib/actions/parse-form-data";
import { updateRegistrationProfileSchema } from "@/lib/validation/forms";

function profileFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("admin profile edit validation", () => {
  it("H-edit-valid: accepts a complete admin profile payload", () => {
    const result = updateRegistrationProfileSchema.safeParse({
      firstName: "Pat",
      lastName: "Golfer",
      email: "PAT@Example.com",
      phone: "5095550100",
      skillLevel: "B",
      preferredPlayers: "Jamie",
      notes: "Left tee",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toBe("pat@example.com");
  });

  it("H-edit-invalid: rejects incomplete or malformed profile fields", () => {
    expect(
      updateRegistrationProfileSchema.safeParse({
        firstName: "",
        lastName: "Golfer",
        email: "not-an-email",
        phone: "12",
        skillLevel: "Z",
      }).success,
    ).toBe(false);
  });

  it("H-edit-form-parse: parses FormData through the admin profile parser", () => {
    const parsed = parseUpdateRegistrationProfileFormData(
      profileFormData({
        firstName: " Pat ",
        lastName: " Golfer ",
        email: "Pat@Example.COM",
        phone: "5095550100",
        skillLevel: "C",
        preferredPlayers: " Jamie ",
        notes: " Notes ",
      }),
    );

    expect(parsed).toEqual({
      firstName: "Pat",
      lastName: "Golfer",
      email: "pat@example.com",
      phone: "5095550100",
      skillLevel: "C",
      preferredPlayers: "Jamie",
      notes: "Notes",
    });
  });
});
