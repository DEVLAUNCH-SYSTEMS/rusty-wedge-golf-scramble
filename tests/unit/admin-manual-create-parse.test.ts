import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import {
  parseAdminManualRegistrationFormData,
  readOptionalPaymentProofFile,
} from "@/lib/actions/parse-form-data";

function profileFormData(
  overrides: Record<string, string> = {},
): FormData {
  const formData = new FormData();
  formData.set("firstName", "Pat");
  formData.set("lastName", "Player");
  formData.set("email", "pat@example.com");
  formData.set("phone", "5095550100");
  formData.set("skillLevel", "B");
  formData.set("paymentStatus", "submitted");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("admin manual create form parsing", () => {
  it("parses registration placement fields and payment status", () => {
    expect(parseAdminManualRegistrationFormData(profileFormData())).toEqual({
      firstName: "Pat",
      lastName: "Player",
      email: "pat@example.com",
      phone: "5095550100",
      skillLevel: "B",
      preferredPlayers: undefined,
      notes: undefined,
      paymentStatus: "submitted",
    });
  });

  it("accepts verified payment status", () => {
    expect(
      parseAdminManualRegistrationFormData(
        profileFormData({ paymentStatus: "verified" }),
      ).paymentStatus,
    ).toBe("verified");
  });

  it("rejects not_submitted payment status", () => {
    expect(() =>
      parseAdminManualRegistrationFormData(
        profileFormData({ paymentStatus: "not_submitted" }),
      ),
    ).toThrow(ZodError);
  });

  it("reads optional payment proof file or returns null", () => {
    const empty = profileFormData();
    expect(readOptionalPaymentProofFile(empty)).toBeNull();

    const withFile = profileFormData();
    const file = new File(["x"], "proof.png", { type: "image/png" });
    withFile.set("paymentProof", file);
    expect(readOptionalPaymentProofFile(withFile)).toBe(file);
  });
});
