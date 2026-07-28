import { z } from "zod";

export const adminManualPaymentStatusSchema = z.enum([
  "submitted",
  "verified",
]);

export type AdminManualPaymentStatus = z.infer<
  typeof adminManualPaymentStatusSchema
>;

export type ResolvedAdminManualPayment = {
  insertPaymentStatus: "submitted";
  markPaymentSubmittedAt: true;
  requiresCapacityConfirm: boolean;
};

export function resolveAdminManualPayment(
  paymentStatus: AdminManualPaymentStatus,
): ResolvedAdminManualPayment {
  return {
    insertPaymentStatus: "submitted",
    markPaymentSubmittedAt: true,
    requiresCapacityConfirm: paymentStatus === "verified",
  };
}
