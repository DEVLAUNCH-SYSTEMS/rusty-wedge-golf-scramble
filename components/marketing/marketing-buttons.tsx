import Link from "next/link";

type MarketingButtonProps = {
  href: string;
  children: string;
  variant?: "gold" | "outline" | "navy";
  className?: string;
};

const VARIANTS = {
  gold: "bg-rw-gold text-rw-navy hover:bg-rw-gold-light",
  outline: "border border-white/50 text-white hover:bg-white/10",
  navy: "bg-rw-navy text-white hover:bg-rw-navy-light",
} as const;

export function MarketingButton({
  href,
  children,
  variant = "gold",
  className = "",
}: MarketingButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition ${VARIANTS[variant]} ${className}`;

  const useAnchor =
    href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:");

  if (useAnchor) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
