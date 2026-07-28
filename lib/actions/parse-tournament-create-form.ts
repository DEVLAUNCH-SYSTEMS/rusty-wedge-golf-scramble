import { ServiceError } from "@/lib/services/service-error";
import { createTournamentSchema } from "@/lib/validation/tournament-create";

import type { CreateTournamentInput } from "@/lib/validation/tournament-create";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseEntryFeeCents(dollars: string): number {
  const normalized = dollars.replace(/[$,]/g, "").trim();
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ServiceError(
      "INVALID_INPUT",
      "Entry fee must be a valid dollar amount.",
    );
  }

  return Math.round(amount * 100);
}

export function parseCreateTournamentFormData(
  formData: FormData,
): CreateTournamentInput {
  const teeTime = readString(formData, "teeTime").trim();

  return createTournamentSchema.parse({
    name: readString(formData, "name"),
    slug: readString(formData, "slug"),
    year: Number(readString(formData, "year")),
    eventDate: readString(formData, "eventDate"),
    teeTime: teeTime || null,
    locationName: readString(formData, "locationName"),
    entryFeeCents: parseEntryFeeCents(readString(formData, "entryFeeDollars")),
    confirmedCapacityLimit: Number(readString(formData, "confirmedCapacityLimit")),
    venmoHandle: readString(formData, "venmoHandle"),
    lifecycleStatus: "draft",
  });
}
