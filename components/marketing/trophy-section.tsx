import Image from "next/image";

import { SectionLabel } from "@/components/marketing/section-label";
import { TROPHY_SECTION } from "@/lib/content/landing-content";

function TrophyHeading() {
  const [beforeAccent, afterAccent] = TROPHY_SECTION.title.split(TROPHY_SECTION.titleAccent);

  return (
    <h2 className="font-display mt-3 text-3xl leading-tight md:text-4xl">
      {beforeAccent}
      <span className="text-rw-gold">{TROPHY_SECTION.titleAccent}</span>
      {afterAccent}
    </h2>
  );
}

function TrophyHighlight({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="font-display text-2xl text-rw-gold">{value}</p>
      <p className="text-sm text-white/70">{label}</p>
    </div>
  );
}

function TrophyCopy() {
  return (
    <div>
      <SectionLabel tone="white">{TROPHY_SECTION.label}</SectionLabel>
      <TrophyHeading />
      <p className="mt-4 text-white/85">{TROPHY_SECTION.body}</p>
      <div className="mt-8 flex flex-wrap gap-8 border-t border-white/10 pt-8">
        {TROPHY_SECTION.highlights.map((item) => (
          <TrophyHighlight key={item.value} {...item} />
        ))}
      </div>
    </div>
  );
}

export function TrophySection() {
  return (
    <section id="trophy" className="bg-rw-navy py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <Image
            src="/images/trophy.png"
            alt="The Rusty Wedge Trophy"
            width={1024}
            height={682}
            className="aspect-3/2 w-full object-cover object-center"
          />
        </div>
        <TrophyCopy />
      </div>
    </section>
  );
}
