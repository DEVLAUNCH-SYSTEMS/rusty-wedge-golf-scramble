import Link from "next/link";

import {
  adminButtonClassName,
  adminSecondaryButtonClassName,
} from "@/components/admin/admin-form-styles";

export function RegistrationsAddPlayerLink({
  readOnlyReason,
}: {
  readOnlyReason?: string;
}) {
  if (readOnlyReason) {
    return (
      <span
        className={`${adminSecondaryButtonClassName} w-full cursor-not-allowed text-center opacity-60 md:w-auto`}
        aria-disabled="true"
        title={readOnlyReason}
      >
        Add player
      </span>
    );
  }

  return (
    <Link
      href="/admin/registrations/new"
      className={`${adminButtonClassName} w-full text-center md:w-auto`}
    >
      Add player
    </Link>
  );
}
