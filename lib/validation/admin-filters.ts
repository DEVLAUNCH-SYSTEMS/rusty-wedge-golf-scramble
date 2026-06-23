import { z } from "zod";

import { skillLevelSchema } from "@/lib/validation/player-profile";

const filterAll = z.literal("all");

export const adminRegistrationListFiltersSchema = z.object({
  q: z.string().trim().max(100).optional(),
  registrationStatus: z
    .enum([
      "all",
      "pending_review",
      "confirmed",
      "waitlisted",
      "cancelled",
    ])
    .optional()
    .default("all"),
  paymentStatus: z
    .enum(["all", "not_submitted", "submitted", "verified", "rejected"])
    .optional()
    .default("all"),
  skillLevel: z.union([filterAll, skillLevelSchema]).optional().default("all"),
  assignment: z.enum(["all", "assigned", "unassigned"]).optional().default("all"),
});

export type AdminRegistrationListFilters = z.infer<
  typeof adminRegistrationListFiltersSchema
>;

export function parseAdminRegistrationListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AdminRegistrationListFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" ? value : undefined;
  };

  return adminRegistrationListFiltersSchema.parse({
    q: read("q"),
    registrationStatus: read("registrationStatus"),
    paymentStatus: read("paymentStatus"),
    skillLevel: read("skillLevel"),
    assignment: read("assignment"),
  });
}
