import {
  IconCalendar,
  IconClock,
  IconMapPin,
} from "@/components/marketing/marketing-icons";
import { SectionLabel } from "@/components/marketing/section-label";
import { INFO_SECTION } from "@/lib/content/landing-content";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

type InfoGridSectionProps = {
  tournament: PublicTournamentView;
};

const ICONS = {
  Date: IconCalendar,
  "Tee Time": IconClock,
  Location: IconMapPin,
} as const;

function buildInfoItems(tournament: PublicTournamentView) {
  return [
    { label: "Date", value: tournament.eventDateShortLabel },
    {
      label: "Tee Time",
      value: `${tournament.teeTimeLabel} ${INFO_SECTION.teeTimeSuffix}`,
    },
    { label: "Location", value: tournament.locationName },
    { label: "Included", value: INFO_SECTION.included },
    { label: "Awards", value: INFO_SECTION.awards },
    { label: "Format", value: INFO_SECTION.format },
  ];
}

function InfoCard({ label, value }: { label: string; value: string }) {
  const Icon = ICONS[label as keyof typeof ICONS] ?? IconCalendar;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rw-navy text-rw-gold">
        <Icon />
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-rw-gold">
          {label}
        </dt>
        <dd className="mt-1 text-sm font-medium text-rw-navy">{value}</dd>
      </div>
    </div>
  );
}

export function InfoGridSection({ tournament }: InfoGridSectionProps) {
  const items = buildInfoItems(tournament);

  return (
    <section id="about" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <SectionLabel>{INFO_SECTION.label}</SectionLabel>
        <h2 className="font-display mt-3 text-3xl text-rw-navy md:text-4xl">
          {INFO_SECTION.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">{INFO_SECTION.subtitle}</p>
        <dl className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <InfoCard key={item.label} {...item} />
          ))}
        </dl>
      </div>
    </section>
  );
}
