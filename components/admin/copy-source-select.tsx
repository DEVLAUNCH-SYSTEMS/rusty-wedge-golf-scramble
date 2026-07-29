import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { CopySourceOptions } from "@/components/admin/copy-source-options";

type CopySource = { id: string; label: string };

export function CopySourceSelect({
  id,
  copySources,
  selectedCopyFromId,
  onChange,
}: {
  id: string;
  copySources: CopySource[];
  selectedCopyFromId: string | null;
  onChange: (copyFromId: string) => void;
}) {
  return (
    <select
      id={id}
      defaultValue={selectedCopyFromId ?? ""}
      className={adminInputClassName}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Use active tournament defaults</option>
      <CopySourceOptions copySources={copySources} />
    </select>
  );
}

export function CopySettingsLabel({ selectId }: { selectId: string }) {
  return (
    <label htmlFor={selectId} className={adminLabelClassName}>
      Copy settings from
    </label>
  );
}
