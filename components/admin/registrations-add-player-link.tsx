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
        className={`${adminSecondaryButtonClassName} cursor-not-allowed opacity-60`}
        aria-disabled="true"
        title={readOnlyReason}
      >
        Add player
      </span>
    );
  }

  return (
    <Link href="/admin/registrations/new" className={adminButtonClassName}>
      Add player
    </Link>
  );
}
