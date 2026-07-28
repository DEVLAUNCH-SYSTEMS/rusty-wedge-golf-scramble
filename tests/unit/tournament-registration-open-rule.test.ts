import { describe, expect, it } from "vitest";

import { ServiceError } from "@/lib/services/service-error";
import { rejectRegistrationOpenConflict } from "@/lib/services/tournament-registration-open-rule";

describe("tournament registration open rule", () => {
  it("allows opening when no other tournament is registration_open", () => {
    expect(() => rejectRegistrationOpenConflict(null)).not.toThrow();
    expect(() => rejectRegistrationOpenConflict(undefined)).not.toThrow();
  });

  it("rejects when another tournament is already registration_open", () => {
    expect(() =>
      rejectRegistrationOpenConflict("other-tournament-id"),
    ).toThrowError(
      expect.objectContaining({
        code: "REGISTRATION_ALREADY_OPEN",
      } satisfies Partial<ServiceError>),
    );
  });
});
