import Link from "next/link";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminPageClassName,
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { BrandLogo } from "@/components/marketing/brand-logo";

export function AdminForbidden() {
  return (
    <div className={`${adminPageClassName} flex items-center justify-center px-4 py-16`}>
      <div className={`${adminCardClassName} max-w-md text-center`}>
        <BrandLogo size="auth" className="mx-auto" />
        <h1 className={`${adminPageHeadingClassName} mt-6`}>Access denied</h1>
        <p className={`${adminPageSubheadingClassName} mt-3`}>
          Your account is signed in but is not on the organizer allowlist. Contact
          an existing organizer to request access.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-rw-gold-accessible hover:underline"
        >
          Return to tournament site
        </Link>
      </div>
    </div>
  );
}
