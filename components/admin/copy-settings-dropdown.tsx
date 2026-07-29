"use client";

import {
  CopySettingsLabel,
  CopySourceSelect,
} from "@/components/admin/copy-source-select";

type CopySource = { id: string; label: string };

export const COPY_SELECT_ID = "copyFromTournament";

export function CopySettingsDropdown({
  copySources,
  selectedCopyFromId,
  onChange,
}: {
  copySources: CopySource[];
  selectedCopyFromId: string | null;
  onChange: (copyFromId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <CopySettingsLabel selectId={COPY_SELECT_ID} />
      <CopySourceSelect
        id={COPY_SELECT_ID}
        copySources={copySources}
        selectedCopyFromId={selectedCopyFromId}
        onChange={onChange}
      />
    </div>
  );
}
