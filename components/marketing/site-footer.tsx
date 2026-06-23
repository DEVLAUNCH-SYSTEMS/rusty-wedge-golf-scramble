import Link from "next/link";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { IconCheck } from "@/components/marketing/marketing-icons";
import { FOOTER } from "@/lib/content/landing-content";

function FooterHighlights() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
      {FOOTER.highlights.map((item) => (
        <li key={item} className="flex items-center gap-2 text-white/80">
          <span className="text-rw-gold">
            <IconCheck />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OrganizerLoginLink() {
  return (
    <Link
      href="/auth/sign-in"
      className="font-medium text-rw-gold underline-offset-4 transition hover:text-rw-gold-light hover:underline"
    >
      {FOOTER.organizerLoginLabel}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-rw-navy-dark py-12 text-white/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center text-sm">
        <BrandLogo size="footer" />
        <p className="font-display text-lg text-white">{FOOTER.title}</p>
        <FooterHighlights />
        <OrganizerLoginLink />
        <p>© {new Date().getFullYear()} {FOOTER.copyright}</p>
      </div>
    </footer>
  );
}
