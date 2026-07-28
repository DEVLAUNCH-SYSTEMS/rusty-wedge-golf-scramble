import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";

export function CopySettingsHint() {
  return (
    <span className={`text-xs ${adminMutedTextClassName}`}>
      Copies venue, fees, capacity, and Venmo only — never player or team data.
    </span>
  );
}
