import { ADMIN_ARCHIVED_READONLY_MESSAGE } from "@/lib/content/admin-archived-readonly";

export function ArchivedTournamentBanner() {
  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      {ADMIN_ARCHIVED_READONLY_MESSAGE}
    </div>
  );
}
