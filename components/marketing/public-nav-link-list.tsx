import type { PublicNavLink } from "@/lib/content/landing-content";

type PublicNavLinkListProps = {
  navLinks: readonly PublicNavLink[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

export function PublicNavLinkList({
  navLinks,
  className,
  linkClassName,
  onNavigate,
}: PublicNavLinkListProps) {
  return (
    <ul className={className}>
      {navLinks.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <a href={link.href} className={linkClassName} onClick={onNavigate}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
