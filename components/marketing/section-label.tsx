type SectionLabelProps = {
  children: string;
  tone?: "gold" | "white";
};

export function SectionLabel({ children, tone = "gold" }: SectionLabelProps) {
  const className =
    tone === "white"
      ? "text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
      : "text-xs font-semibold uppercase tracking-[0.25em] text-rw-gold-accessible";

  return <p className={className}>{children}</p>;
}
