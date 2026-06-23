import { BrandLogo } from "@/components/marketing/brand-logo";
import { IconCheck } from "@/components/marketing/marketing-icons";
import { SectionLabel } from "@/components/marketing/section-label";
import { REGISTRATION_SECTION } from "@/lib/content/landing-content";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

type RegistrationSummaryProps = {
  tournament: PublicTournamentView;
};

function EntryFeeCard({ tournament }: RegistrationSummaryProps) {
  return (
    <div className="mt-6 grid gap-6 rounded-xl bg-rw-navy p-6 text-white sm:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          {REGISTRATION_SECTION.entryFeeLabel}
        </p>
        <p className="font-display mt-2 text-4xl text-white">{tournament.entryFeeLabel}</p>
        <p className="mt-1 text-sm text-white/80">{REGISTRATION_SECTION.priceLabel}</p>
      </div>
      <ul className="space-y-2 text-sm">
        {REGISTRATION_SECTION.includes.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="text-rw-gold">
              <IconCheck />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HowItWorksList() {
  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rw-navy">
        {REGISTRATION_SECTION.howItWorksLabel}
      </p>
      <ol className="mt-4 space-y-3">
        {REGISTRATION_SECTION.howItWorks.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rw-navy text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RegistrationSummary({ tournament }: RegistrationSummaryProps) {
  return (
    <div>
      <SectionLabel>{REGISTRATION_SECTION.label}</SectionLabel>
      <h2 className="font-display mt-3 text-3xl leading-tight text-rw-navy md:text-4xl">
        {REGISTRATION_SECTION.title}
      </h2>
      <EntryFeeCard tournament={tournament} />
      <p className="mt-6 text-sm leading-6 text-slate-600">
        {REGISTRATION_SECTION.description}
      </p>
      <HowItWorksList />
      <BrandLogo size="registration" className="mt-8" />
    </div>
  );
}
