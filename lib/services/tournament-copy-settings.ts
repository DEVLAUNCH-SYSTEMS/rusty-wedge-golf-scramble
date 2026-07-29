import { requireTournamentById } from "@/lib/services/tournament";
import { createTournament } from "@/lib/services/tournament-create";
import { createTournamentFromPriorSchema } from "@/lib/validation/tournament-copy-settings";

import type { Tournament } from "@/lib/services/tournament";
import type {
  CreateTournamentFromPriorInput,
  TournamentConfigOverrides,
} from "@/lib/validation/tournament-copy-settings";
import type { CreateTournamentInput } from "@/lib/validation/tournament-create";

export type CopiedTournamentConfig = Pick<
  Tournament,
  | "locationName"
  | "entryFeeCents"
  | "confirmedCapacityLimit"
  | "venmoHandle"
  | "teeTime"
>;

export function buildSlugForYear(
  sourceSlug: string,
  sourceYear: number,
  targetYear: number,
): string {
  const prefix = `${sourceYear}-`;

  if (sourceSlug.startsWith(prefix)) {
    return `${targetYear}-${sourceSlug.slice(prefix.length)}`;
  }

  return `${targetYear}-${sourceSlug}`;
}

export function buildNameForYear(
  sourceName: string,
  sourceYear: number,
  targetYear: number,
): string {
  const sourceYearText = String(sourceYear);

  if (!sourceName.includes(sourceYearText)) {
    return sourceName;
  }

  return sourceName.replaceAll(sourceYearText, String(targetYear));
}

export function pickCopiedTournamentConfig(
  source: Tournament,
): CopiedTournamentConfig {
  return {
    locationName: source.locationName,
    entryFeeCents: source.entryFeeCents,
    confirmedCapacityLimit: source.confirmedCapacityLimit,
    venmoHandle: source.venmoHandle,
    teeTime: source.teeTime,
  };
}

export function buildCreateInputFromPriorTournament(
  source: Tournament,
  input: {
    year: number;
    eventDate: string;
  } & TournamentConfigOverrides,
): CreateTournamentInput {
  const copied = pickCopiedTournamentConfig(source);

  return {
    name: input.name ?? buildNameForYear(source.name, source.year, input.year),
    slug: input.slug ?? buildSlugForYear(source.slug, source.year, input.year),
    year: input.year,
    eventDate: input.eventDate,
    teeTime: input.teeTime ?? copied.teeTime,
    locationName: input.locationName ?? copied.locationName,
    entryFeeCents: input.entryFeeCents ?? copied.entryFeeCents,
    confirmedCapacityLimit:
      input.confirmedCapacityLimit ?? copied.confirmedCapacityLimit,
    venmoHandle: input.venmoHandle ?? copied.venmoHandle,
    lifecycleStatus: input.lifecycleStatus ?? "draft",
    registrationOpensAt: null,
    registrationClosesAt: null,
  };
}

export async function createTournamentFromPriorSettings(
  input: CreateTournamentFromPriorInput,
): Promise<Tournament> {
  const parsed = createTournamentFromPriorSchema.parse(input);
  const source = await requireTournamentById(parsed.sourceTournamentId);
  const createInput = buildCreateInputFromPriorTournament(source, parsed);

  return createTournament(createInput);
}
