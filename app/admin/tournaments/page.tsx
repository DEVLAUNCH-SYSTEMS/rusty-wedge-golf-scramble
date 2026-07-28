import Link from "next/link";

import {
  adminLinkClassName,
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { TournamentListTable } from "@/components/admin/tournament-list-table";
import { listTournamentsForAdmin } from "@/lib/services/admin-tournament-list";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  const tournaments = await listTournamentsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className={adminPageHeadingClassName}>Tournaments</h1>
          <p className={adminPageSubheadingClassName}>
            View tournament years, lifecycle status, and which event is currently
            active on the public site.
          </p>
        </div>
        <Link href="/admin/tournaments/new" className={adminLinkClassName}>
          Create tournament
        </Link>
      </div>

      <TournamentListTable tournaments={tournaments} />
    </div>
  );
}
