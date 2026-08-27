import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  teamsPublicationStatusDescription,
  teamsPublicationStatusLabel,
} from "@/lib/content/teams-publication-copy";

export function teamsPublicationStatusTone(
  teamsPublished: boolean,
): "neutral" | "success" {
  return teamsPublished ? "success" : "neutral";
}

export function TeamsPublicationStatus({
  teamsPublished,
}: {
  teamsPublished: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge
        label={teamsPublicationStatusLabel(teamsPublished)}
        tone={teamsPublicationStatusTone(teamsPublished)}
      />
      <p className={`text-sm ${adminMutedTextClassName}`}>
        {teamsPublicationStatusDescription(teamsPublished)}
      </p>
    </div>
  );
}
