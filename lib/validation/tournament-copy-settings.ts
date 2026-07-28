import { z } from "zod";

import { FIELD_LIMITS } from "@/lib/validation/field-limits";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";
import type { CreateTournamentInput } from "@/lib/validation/tournament-create";

const CREATABLE_LIFECYCLE_STATUSES = [
  "draft",
  "registration_open",
  "registration_closed",
  "completed",
] as const satisfies readonly TournamentLifecycleStatus[];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const teeTimePattern = /^\d{2}:\d{2}(:\d{2})?$/;
const venmoHandlePattern = /^@[\w-]+$/;

const createTournamentOverrideSchema = z.object({
  name: z.string().trim().min(1).max(FIELD_LIMITS.tournamentName).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(FIELD_LIMITS.tournamentSlug)
    .regex(
      slugPattern,
      "Slug must use lowercase letters, numbers, and hyphens.",
    )
    .optional(),
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
    .max(FIELD_LIMITS.tournamentLocationName)
    .optional(),
  entryFeeCents: z.number().int().min(0).optional(),
  confirmedCapacityLimit: z.number().int().min(1).optional(),
  venmoHandle: z
    .string()
    .trim()
    .min(1)
    .max(FIELD_LIMITS.venmoHandle)
    .regex(venmoHandlePattern, "Venmo handle must start with @.")
    .optional(),
  lifecycleStatus: z.enum(CREATABLE_LIFECYCLE_STATUSES).optional(),
});

export const createTournamentFromPriorSchema = z
  .object({
    sourceTournamentId: z.string().uuid(),
    year: z.number().int().min(2000).max(2100),
    eventDate: z.string().date(),
  })
  .and(createTournamentOverrideSchema);

export type CreateTournamentFromPriorInput = z.infer<
  typeof createTournamentFromPriorSchema
>;

export type TournamentConfigOverrides = Partial<
  Pick<
    CreateTournamentInput,
    | "name"
    | "slug"
    | "teeTime"
    | "locationName"
    | "entryFeeCents"
    | "confirmedCapacityLimit"
    | "venmoHandle"
    | "lifecycleStatus"
  >
>;
