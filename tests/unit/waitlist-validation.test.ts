import { describe, expect, it } from "vitest";

import { submitWaitlistSchema } from "@/lib/validation/forms";

describe("waitlist validation", () => {
  it("H10: requires skill level", () => {
    const result = submitWaitlistSchema.safeParse({
      firstName: "Pat",
      lastName: "Player",
      email: "player@example.com",
      phone: "5095550100",
    });

    expect(result.success).toBe(false);
  });
});
