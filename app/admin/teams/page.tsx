import { TeamsPageContent, TeamsPageHeader } from "@/components/admin/teams-page-content";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <TeamsPageHeader />
      <TeamsPageContent />
    </div>
  );
}
