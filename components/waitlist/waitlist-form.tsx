"use client";

import { formSubmitClassName } from "@/components/forms/form-field-styles";
import { FormMessage } from "@/components/forms/form-message";
import { PlayerProfileFields } from "@/components/forms/player-profile-fields";
import { SectionLabel } from "@/components/marketing/section-label";
import { useWaitlistForm } from "@/hooks/use-waitlist-form";
import { PREFERRED_PLAYERS_DISCLAIMER } from "@/lib/content/organizers";

function WaitlistHeader() {
  return (
    <div className="border-b border-slate-200 pb-5">
      <SectionLabel>Waitlist</SectionLabel>
      <h3 className="font-display mt-2 text-2xl text-rw-navy">Join the Waitlist</h3>
    </div>
  );
}

export function WaitlistForm() {
  const { message, isSubmitting, handleSubmit } = useWaitlistForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="public-form flex flex-col gap-5"
      aria-label="Tournament waitlist"
    >
      <WaitlistHeader />
      <p className="text-sm text-slate-600">
        Registration is full for now. Join the waitlist and organizers will reach out
        if a spot opens.
      </p>
      <PlayerProfileFields idPrefix="waitlist" />
      <p className="text-xs text-slate-500">{PREFERRED_PLAYERS_DISCLAIMER}</p>
      <button type="submit" disabled={isSubmitting} className={formSubmitClassName}>
        {isSubmitting ? "Submitting…" : "Join Waitlist"}
      </button>
      {message ? (
        <FormMessage tone={message.tone} message={message.text} />
      ) : null}
    </form>
  );
}
