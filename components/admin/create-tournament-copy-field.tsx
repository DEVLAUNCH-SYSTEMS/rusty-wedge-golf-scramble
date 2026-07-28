"use client";

import { CopySettingsDropdown } from "@/components/admin/copy-settings-dropdown";
import { CopySettingsHint } from "@/components/admin/copy-settings-hint";

type CopySource = { id: string; label: string };

function copyPath(copyFromId: string): string {
  return `/admin/tournaments/new?copyFrom=${encodeURIComponent(copyFromId)}`;
}

export function CreateTournamentCopyField({
  copySources,
  selectedCopyFromId,
  onNavigate,
}: {
  copySources: CopySource[];
  selectedCopyFromId: string | null;
  onNavigate: (path: string) => void;
}) {
  if (copySources.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <CopySettingsDropdown
        copySources={copySources}
        selectedCopyFromId={selectedCopyFromId}
        onChange={(value) => onNavigate(value ? copyPath(value) : "/admin/tournaments/new")}
      />
      <CopySettingsHint />
    </div>
  );
}
