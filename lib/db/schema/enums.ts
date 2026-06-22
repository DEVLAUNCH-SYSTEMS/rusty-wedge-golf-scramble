import { pgEnum } from "drizzle-orm/pg-core";

export const skillLevelEnum = pgEnum("skill_level", ["A", "B", "C", "D"]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending_review",
  "confirmed",
  "waitlisted",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "not_submitted",
  "submitted",
  "verified",
  "rejected",
]);

export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "active",
  "promoted",
  "removed",
]);
