import { z } from "zod";

import { FIELD_LIMITS } from "@/lib/validation/field-limits";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

const CREATABLE_LIFECYCLE_STATUSES = [
  "draft",
  "registration_open",
  "registration_closed",
  "completed",
] as const satisfies readonly TournamentLifecycleStatus[];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const teeTimePattern = /^\d{2}:\d{2}(:\d{2})?$/;
const venmoHandlePattern = /^@[\w-]+$/;

export const createTournamentFieldsSchema = z.object({
    name: z.string().trim().min(1).max(FIELD_LIMITS.tournamentName),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(FIELD_LIMITS.tournamentSlug)
      .regex(
        slugPattern,
        "Slug must use lowercase letters, numbers, and hyphens.",
      ),
    year: z.number().int().min(2000).max(2100),
    eventDate: z.string().date(),
    teeTime: z
      .string()
      .trim()
      .regex(teeTimePattern, "Tee time must use HH:MM or HH:MM:SS.")
      .optional()
      .nullable(),
    locationName: z
      .string()
      .trim()
      .min(1)
      .max(FIELD_LIMITS.tournamentLocationName),
    entryFeeCents: z.number().int().min(0).default(8500),
    confirmedCapacityLimit: z.number().int().min(1).default(68),
    venmoHandle: z
      .string()
      .trim()
      .min(1)
      .max(FIELD_LIMITS.venmoHandle)
      .regex(venmoHandlePattern, "Venmo handle must start with @."),
    lifecycleStatus: z
      .enum(CREATABLE_LIFECYCLE_STATUSES)
      .default("draft"),
    registrationOpensAt: z.coerce.date().optional().nullable(),
    registrationClosesAt: z.coerce.date().optional().nullable(),
  });

export const createTournamentSchema = createTournamentFieldsSchema.refine(
  (value) => value.slug.startsWith(`${value.year}-`),
  {
    message: "Slug must start with the tournament year.",
    path: ["slug"],
  },
);

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
