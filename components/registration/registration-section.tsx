import { formCardClassName } from "@/components/forms/form-field-styles";
import { PublicClientShell } from "@/components/marketing/public-client-shell";
import { RegistrationForm } from "@/components/registration/registration-form";
import { RegistrationSummary } from "@/components/registration/registration-summary";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

type RegistrationSectionProps = {
  tournament: PublicTournamentView;
  hasCapacity: boolean;
};

function RegistrationClosed() {
  return (
    <section id="register" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl text-rw-navy">Registration closed</h2>
        <p className="mt-4 text-slate-600">
          Online registration is closed for this event. Contact the organizers below
          if you have questions.
        </p>
      </div>
    </section>
  );
}

function RegistrationFormCard({
  hasCapacity,
  tournament,
}: Pick<RegistrationSectionProps, "hasCapacity" | "tournament">) {
  return (
    <div className={formCardClassName}>
      <PublicClientShell>
        {hasCapacity ? (
          <RegistrationForm tournament={tournament} />
        ) : (
          <WaitlistForm />
        )}
      </PublicClientShell>
    </div>
  );
}

export function RegistrationSection({
  tournament,
  hasCapacity,
}: RegistrationSectionProps) {
  if (!tournament.registrationEnabled) {
    return <RegistrationClosed />;
  }

  return (
    <section id="register" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <RegistrationSummary tournament={tournament} />
        <RegistrationFormCard hasCapacity={hasCapacity} tournament={tournament} />
      </div>
    </section>
  );
}
