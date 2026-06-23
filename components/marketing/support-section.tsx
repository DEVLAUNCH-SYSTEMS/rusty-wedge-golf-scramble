import { SectionLabel } from "@/components/marketing/section-label";
import { OrganizerContactCards } from "@/components/marketing/support-cards";
import { SUPPORT_SECTION } from "@/lib/content/landing-content";

export function SupportSection() {
  return (
    <section id="contact" className="scroll-mt-24 bg-rw-navy py-20 text-white">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <SectionLabel tone="white">{SUPPORT_SECTION.label}</SectionLabel>
        <h2 className="font-display mt-3 text-3xl md:text-4xl">{SUPPORT_SECTION.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/75">{SUPPORT_SECTION.subtitle}</p>
        <OrganizerContactCards />
      </div>
    </section>
  );
}
