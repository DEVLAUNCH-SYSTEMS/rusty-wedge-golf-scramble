import Link from "next/link";

import {
  adminLinkClassName,
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";
import { CreateTournamentForm } from "@/components/admin/create-tournament-form";
import {
  getCreateTournamentPageData,
  readCopyFromSearchParam,
} from "@/lib/services/tournament-create-page-data";

export const dynamic = "force-dynamic";

export default async function AdminCreateTournamentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pageData = await getCreateTournamentPageData(
    readCopyFromSearchParam(params),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/tournaments" className={adminLinkClassName}>
          ← Back to tournaments
        </Link>
        <h1 className={`${adminPageHeadingClassName} mt-2`}>Create tournament</h1>
        <p className={adminPageSubheadingClassName}>
          Set up a new year as a draft. Copy settings from a prior event or
          start from the active tournament defaults, then adjust as needed.
        </p>
      </div>

      <CreateTournamentForm {...pageData} />
    </div>
  );
}
