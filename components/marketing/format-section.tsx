import { SectionLabel } from "@/components/marketing/section-label";
import { FORMAT_SECTION } from "@/lib/content/landing-content";

function FormatFeature({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rw-navy text-rw-gold">
        <span className="text-xs font-bold">RW</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-rw-navy">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function FormatSection() {
  return (
    <section id="format" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionLabel>{FORMAT_SECTION.label}</SectionLabel>
          <h2 className="font-display mt-3 text-3xl text-rw-navy md:text-4xl">
            {FORMAT_SECTION.titleBefore}
            <span className="text-blue-600">{FORMAT_SECTION.titleAccent}</span>
          </h2>
          <p className="mt-4 text-slate-600">{FORMAT_SECTION.body}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {FORMAT_SECTION.features.map((feature) => (
            <FormatFeature key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
