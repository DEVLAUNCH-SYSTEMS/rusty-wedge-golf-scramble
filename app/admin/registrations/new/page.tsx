import Link from "next/link";

import { AddPlayerForm } from "@/components/admin/add-player-form";
import {
  adminLinkClassName,
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { ArchivedTournamentBanner } from "@/components/admin/archived-tournament-banner";
import { adminArchivedReadOnlyReason } from "@/lib/content/admin-archived-readonly";
import { requireActiveTournament } from "@/lib/services/tournament";

export const dynamic = "force-dynamic";

export default async function AdminAddPlayerPage() {
  const tournament = await requireActiveTournament();
  const readOnlyReason = adminArchivedReadOnlyReason(tournament.lifecycleStatus);

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

      {readOnlyReason ? <ArchivedTournamentBanner /> : null}
      <AddPlayerForm readOnlyReason={readOnlyReason} />
    </div>
  );
}
