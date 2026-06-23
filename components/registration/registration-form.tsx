"use client";

import { formSubmitClassName } from "@/components/forms/form-field-styles";
import { FormMessage } from "@/components/forms/form-message";
import { PaymentProofField } from "@/components/forms/payment-proof-field";
import { PlayerProfileFields } from "@/components/forms/player-profile-fields";
import { useRegistrationForm } from "@/hooks/use-registration-form";
import { REGISTRATION_FORM } from "@/lib/content/landing-content";

import type { PublicTournamentView } from "@/lib/format/tournament-display";

type RegistrationFormProps = {
  tournament: PublicTournamentView;
};

function FormHeader() {
  return (
    <div className="border-b border-slate-200 pb-5">
      <h3 className="font-display text-2xl text-rw-navy">{REGISTRATION_FORM.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{REGISTRATION_FORM.subtitle}</p>
    </div>
  );
}

function VenmoInstructions({ tournament }: RegistrationFormProps) {
  return (
    <p className="rounded-lg bg-rw-gray px-4 py-3 text-sm text-slate-700">
      Send {tournament.entryFeeLabel} via Venmo to{" "}
      <span className="font-semibold text-rw-navy">{tournament.venmoHandle}</span>, then
      upload your payment screenshot below.
    </p>
  );
}

export function RegistrationForm({ tournament }: RegistrationFormProps) {
  const { message, isSubmitting, handleSubmit } = useRegistrationForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="public-form flex flex-col gap-5"
      aria-label="Tournament registration"
    >
      <FormHeader />
      <VenmoInstructions tournament={tournament} />
      <PlayerProfileFields idPrefix="registration" />
      <PaymentProofField />
      <button type="submit" disabled={isSubmitting} className={formSubmitClassName}>
        {isSubmitting ? "Submitting…" : "Register Now"}
      </button>
      {message ? (
        <FormMessage tone={message.tone} message={message.text} />
      ) : null}
    </form>
  );
}
