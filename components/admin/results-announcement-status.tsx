import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { StatusBadge } from "@/components/admin/status-badge";

export function ResultsAnnouncementStatus({
  statusLabel,
  statusTone,
  statusDescription,
  recipientCount,
}: {
  statusLabel: string;
  statusTone: "neutral" | "success" | "warning" | "danger" | "info";
  statusDescription: string;
  recipientCount: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge label={statusLabel} tone={statusTone} />
      <p className={`text-sm ${adminMutedTextClassName}`}>{statusDescription}</p>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        Confirmed recipients: {recipientCount}
      </p>
    </div>
  );
}
