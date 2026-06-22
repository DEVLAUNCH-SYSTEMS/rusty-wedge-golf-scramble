import { z } from "zod";

import { FIELD_LIMITS } from "@/lib/validation/field-limits";
import { playerProfileSchema } from "@/lib/validation/player-profile";

export const submitRegistrationSchema = playerProfileSchema;

export type SubmitRegistrationInput = z.infer<typeof submitRegistrationSchema>;

export const submitWaitlistSchema = playerProfileSchema;

export type SubmitWaitlistInput = z.infer<typeof submitWaitlistSchema>;

export const rejectRegistrationSchema = z.object({
  reason: z.string().trim().min(1).max(FIELD_LIMITS.rejectionReason),
});

export const cancelRegistrationSchema = z.object({
  adminNotes: z.string().trim().min(1).max(FIELD_LIMITS.adminNotes),
});

export const updateRegistrationNotesSchema = z
  .object({
    paymentReviewNotes: z
      .string()
      .trim()
      .max(FIELD_LIMITS.paymentReviewNotes)
      .optional(),
    adminNotes: z.string().trim().max(FIELD_LIMITS.adminNotes).optional(),
  })
  .refine(
    (value) =>
      value.paymentReviewNotes !== undefined || value.adminNotes !== undefined,
    { message: "At least one notes field is required." },
  );

export const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(FIELD_LIMITS.teamName),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
