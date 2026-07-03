import { IconMail, IconPhone } from "@/components/marketing/marketing-icons";
import { SUPPORT_SECTION } from "@/lib/content/landing-content";
import { ORGANIZERS } from "@/lib/content/organizers";

function organizerPhoneHref(phone: string): string {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}

function OrganizerContactLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 text-rw-gold transition hover:text-rw-gold-light"
    >
      <span className="text-rw-gold/80">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function OrganizerContactLinks({
  organizer,
}: {
  organizer: (typeof ORGANIZERS)[number];
}) {
  return (
    <div className="space-y-2 text-sm">
      <OrganizerContactLink
        href={`mailto:${organizer.email}`}
        icon={<IconMail className="h-4 w-4" />}
        label={organizer.email}
      />
      <OrganizerContactLink
        href={organizerPhoneHref(organizer.phone)}
        icon={<IconPhone />}
        label={organizer.phone}
      />
    </div>
  );
}

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
      <OrganizerContactLinks organizer={organizer} />
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
