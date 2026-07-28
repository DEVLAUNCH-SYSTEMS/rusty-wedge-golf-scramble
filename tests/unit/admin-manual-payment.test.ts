import { describe, expect, it } from "vitest";

import { resolveAdminManualPayment } from "@/lib/services/admin-manual-payment";

describe("admin manual payment state matrix", () => {
  it("maps submitted to submitted insert without confirm", () => {
    expect(resolveAdminManualPayment("submitted")).toEqual({
      insertPaymentStatus: "submitted",
      markPaymentSubmittedAt: true,
      requiresCapacityConfirm: false,
    });
  });

  it("maps verified to submitted insert with capacity confirm", () => {
    expect(resolveAdminManualPayment("verified")).toEqual({
      insertPaymentStatus: "submitted",
      markPaymentSubmittedAt: true,
      requiresCapacityConfirm: true,
    });
  });
});
