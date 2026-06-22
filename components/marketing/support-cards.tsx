import { MarketingButton } from "@/components/marketing/marketing-buttons";
import { IconMail } from "@/components/marketing/marketing-icons";
import { SUPPORT_SECTION } from "@/lib/content/landing-content";
import { ORGANIZERS } from "@/lib/content/organizers";

function OrganizerDetails({
  organizer,
}: {
  organizer: (typeof ORGANIZERS)[number];
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold text-white">{organizer.name}</p>
        <p className="text-sm text-white/70">{SUPPORT_SECTION.organizerRole}</p>
      </div>
      <p className="text-sm text-white/80">
        <a href={`tel:${organizer.phone}`} className="hover:text-rw-gold">
          {organizer.phone}
        </a>
      </p>
      <MarketingButton href={`mailto:${organizer.email}`} variant="gold" className="text-xs">
        {SUPPORT_SECTION.contactButton}
      </MarketingButton>
    </div>
  );
}

function OrganizerContactCard({
  organizer,
}: {
  organizer: (typeof ORGANIZERS)[number];
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-rw-navy-card p-8 text-left">
      <div className="flex items-start gap-4">
        <div className="rounded-full border border-rw-gold/40 p-3 text-rw-gold">
          <IconMail />
        </div>
        <OrganizerDetails organizer={organizer} />
      </div>
    </article>
  );
}

export function OrganizerContactCards() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      {ORGANIZERS.map((organizer) => (
        <OrganizerContactCard key={organizer.name} organizer={organizer} />
      ))}
    </div>
  );
}
