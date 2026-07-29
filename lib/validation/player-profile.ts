import { z } from "zod";

import { FIELD_LIMITS } from "@/lib/validation/field-limits";

export const skillLevelSchema = z.enum(["A", "B", "C", "D"]);

export const playerNameSchema = z.object({
  firstName: z.string().trim().min(1).max(FIELD_LIMITS.firstName),
  lastName: z.string().trim().min(1).max(FIELD_LIMITS.lastName),
});

export const playerContactSchema = z.object({
  email: z.string().trim().email().max(FIELD_LIMITS.email),
  phone: z.string().trim().min(7).max(FIELD_LIMITS.phone),
});

export const playerOptionalTextSchema = z.object({
  preferredPlayers: z
    .string()
    .trim()
    .max(FIELD_LIMITS.preferredPlayers)
    .optional(),
  notes: z.string().trim().max(FIELD_LIMITS.playerNotes).optional(),
});

export type PlayerProfileInput = z.infer<typeof playerNameSchema> &
  z.infer<typeof playerContactSchema> &
  z.infer<typeof playerOptionalTextSchema> & {
    skillLevel: z.infer<typeof skillLevelSchema>;
  };

export const playerProfileSchema = playerNameSchema
  .merge(playerContactSchema)
  .merge(playerOptionalTextSchema)
  .extend({
    skillLevel: skillLevelSchema,
  });

export function normalizePlayerEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Admin profile edit — same fields as public profile, email lowercased. */
export const updateRegistrationProfileSchema = playerProfileSchema.transform(
  (profile) => ({
    ...profile,
    email: normalizePlayerEmail(profile.email),
  }),
);

export type UpdateRegistrationProfileInput = z.infer<
  typeof updateRegistrationProfileSchema
>;
