import { TeamsPageContent, TeamsPageHeader } from "@/components/admin/teams-page-content";
import { parseAdminTeamListSort } from "@/lib/validation/admin-team-list-sort";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sortParam = typeof params.sort === "string" ? params.sort : undefined;
  const sort = parseAdminTeamListSort(sortParam);

  return (
    <div className="flex flex-col gap-6">
      <TeamsPageHeader />
      <TeamsPageContent sort={sort} />
    </div>
  );
}
