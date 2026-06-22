import { SectionLabel } from "@/components/marketing/section-label";
import { EXPERIENCE_SECTION } from "@/lib/content/landing-content";

const ACCENTS = {
  green: "bg-emerald-600",
  gold: "bg-rw-gold text-rw-navy",
  blue: "bg-blue-600",
} as const;

function ExperienceCard({
  title,
  body,
  accent,
}: (typeof EXPERIENCE_SECTION.cards)[number]) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${ACCENTS[accent as keyof typeof ACCENTS]}`}
      >
        {title.slice(0, 1)}
      </div>
      <h3 className="text-xl font-semibold text-rw-navy">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}

export function MissionSection() {
  return (
    <section id="experience" className="scroll-mt-24 bg-rw-gray py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <SectionLabel>{EXPERIENCE_SECTION.label}</SectionLabel>
        <h2 className="font-display mt-3 text-3xl text-rw-navy md:text-4xl">
          {EXPERIENCE_SECTION.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          {EXPERIENCE_SECTION.subtitle}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {EXPERIENCE_SECTION.cards.map((card) => (
            <ExperienceCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
