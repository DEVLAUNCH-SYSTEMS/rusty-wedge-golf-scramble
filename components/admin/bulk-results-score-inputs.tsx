import { adminInputClassName } from "@/components/admin/admin-form-styles";

function bulkScoreInputClassName(): string {
  return `${adminInputClassName} max-w-24`;
}

export function BulkScoreStrokesInput({
  teamId,
  teamNumber,
  scoreTotalStrokes,
}: {
  teamId: string;
  teamNumber: number | null;
  scoreTotalStrokes: number | null;
}) {
  const teamLabel = teamNumber == null ? "team" : `Team #${teamNumber}`;

  return (
    <input
      type="number"
      name={`scoreTotalStrokes_${teamId}`}
      min={1}
      step={1}
      defaultValue={scoreTotalStrokes ?? undefined}
      aria-label={`Total strokes for ${teamLabel}`}
      className={bulkScoreInputClassName()}
    />
  );
}
