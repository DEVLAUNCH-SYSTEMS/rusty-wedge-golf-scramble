import {
  getActiveTournament,
  getTournamentById,
} from "@/lib/services/tournament";
import {
  buildCreateInputFromPriorTournament,
} from "@/lib/services/tournament-copy-settings";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

export type TournamentCreateFormValues = {
  name: string;
  slug: string;
  year: number;
  eventDate: string;
  teeTime: string;
  locationName: string;
  entryFeeDollars: string;
  confirmedCapacityLimit: number;
  venmoHandle: string;
};

export function suggestNextTournamentYear(years: number[]): number {
  const maxExistingYear = years.length > 0 ? Math.max(...years) : 0;
  const calendarYear = new Date().getFullYear();

  return Math.max(maxExistingYear, calendarYear) + 1;
}

function shiftEventDateYear(eventDate: string, targetYear: number): string {
  const parts = eventDate.split("-");

  if (parts.length !== 3) {
    return `${targetYear}-08-28`;
  }

  return `${targetYear}-${parts[1]}-${parts[2]}`;
}

function formatEntryFeeDollars(entryFeeCents: number): string {
  return (entryFeeCents / 100).toFixed(2);
}

function formatTeeTimeForForm(teeTime: string | null | undefined): string {
  if (!teeTime) {
    return "";
  }

  return teeTime.slice(0, 5);
}

function toFormValues(input: {
  name: string;
  slug: string;
  year: number;
  eventDate: string;
  teeTime?: string | null;
  locationName: string;
  entryFeeCents: number;
  confirmedCapacityLimit: number;
  venmoHandle: string;
}): TournamentCreateFormValues {
  return {
    name: input.name,
    slug: input.slug,
    year: input.year,
    eventDate: input.eventDate,
    teeTime: formatTeeTimeForForm(input.teeTime),
    locationName: input.locationName,
    entryFeeDollars: formatEntryFeeDollars(input.entryFeeCents),
    confirmedCapacityLimit: input.confirmedCapacityLimit,
    venmoHandle: input.venmoHandle,
  };
}

function blankDefaults(year: number): TournamentCreateFormValues {
  return {
    name: "The Rusty Wedge Golf Scramble",
    slug: `${year}-rusty-wedge`,
    year,
    eventDate: `${year}-08-28`,
    teeTime: "09:00",
    locationName: "",
    entryFeeDollars: "85.00",
    confirmedCapacityLimit: 68,
    venmoHandle: "",
  };
}

export async function resolveCreateTournamentFormDefaults(
  tournaments: AdminTournamentListItem[],
  copyFromId: string | null,
): Promise<TournamentCreateFormValues> {
  const year = suggestNextTournamentYear(tournaments.map((row) => row.year));

  if (!copyFromId) {
    const active = await getActiveTournament();

    if (!active) {
      return blankDefaults(year);
    }

    return toFormValues(
      buildCreateInputFromPriorTournament(active, {
        year,
        eventDate: shiftEventDateYear(active.eventDate, year),
      }),
    );
  }

  const source = await getTournamentById(copyFromId);

  if (!source) {
    return blankDefaults(year);
  }

  return toFormValues(
    buildCreateInputFromPriorTournament(source, {
      year,
      eventDate: shiftEventDateYear(source.eventDate, year),
    }),
  );
}
