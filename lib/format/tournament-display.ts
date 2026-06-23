import type { ActiveTournament } from "@/lib/services/tournament";

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatEventDate(eventDate: string): string {
  const date = new Date(`${eventDate}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventDateShort(eventDate: string): string {
  const date = new Date(`${eventDate}T12:00:00`);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();

  return `${weekday}, ${month} ${day}${ordinalSuffix(day)}`;
}

export function formatTeeTime(teeTime: string | null): string {
  if (!teeTime) {
    return "TBD";
  }

  const [hours, minutes] = teeTime.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEntryFee(entryFeeCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(entryFeeCents / 100);
}

export type PublicTournamentView = {
  name: string;
  eventDateLabel: string;
  eventDateShortLabel: string;
  teeTimeLabel: string;
  locationName: string;
  entryFeeLabel: string;
  venmoHandle: string;
  registrationEnabled: boolean;
};

export function toPublicTournamentView(
  tournament: ActiveTournament,
): PublicTournamentView {
  return {
    name: tournament.name,
    eventDateLabel: formatEventDate(tournament.eventDate),
    eventDateShortLabel: formatEventDateShort(tournament.eventDate),
    teeTimeLabel: formatTeeTime(tournament.teeTime),
    locationName: tournament.locationName,
    entryFeeLabel: formatEntryFee(tournament.entryFeeCents),
    venmoHandle: tournament.venmoHandle,
    registrationEnabled: tournament.registrationEnabled,
  };
}
