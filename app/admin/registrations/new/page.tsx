import Link from "next/link";

import { AddPlayerForm } from "@/components/admin/add-player-form";
import {
  adminLinkClassName,
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";

export const dynamic = "force-dynamic";

export default function AdminAddPlayerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/registrations" className={adminLinkClassName}>
          ← Back to registrations
        </Link>
        <h1 className={`${adminPageHeadingClassName} mt-2`}>Add player</h1>
        <p className={adminPageSubheadingClassName}>
          Create a registration or waitlist entry for the active tournament.
          Contact the player offline if needed.
        </p>
      </div>

      <AddPlayerForm />
    </div>
  );
}
