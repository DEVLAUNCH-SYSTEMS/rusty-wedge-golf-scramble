import {
  finishingPlacementCurrentLabel,
  teamScoreCurrentLabel,
} from "@/lib/content/finishing-placement-admin-copy";
import { formatFinishingPlacementLabel } from "@/lib/format/finishing-placement-display";

function TeamResultsCurrentLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p className="text-sm text-slate-700">
      <span className="font-medium text-rw-navy">{label}: </span>
      {value}
    </p>
  );
}

function buildTeamResultsCurrentLines(input: {
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
}) {
  return [
    {
      label: "Placement",
      value: finishingPlacementCurrentLabel(
        input.finishingPlacement,
        formatFinishingPlacementLabel,
      ),
    },
    {
      label: "Relative to par",
      value: teamScoreCurrentLabel(input.scoreRelativeToPar),
    },
    {
      label: "Total strokes",
      value: teamScoreCurrentLabel(input.scoreTotalStrokes),
    },
  ];
}

export function TeamResultsCurrentValues({
  finishingPlacement,
  scoreRelativeToPar,
  scoreTotalStrokes,
}: {
  finishingPlacement: number | null;
  scoreRelativeToPar: number | null;
  scoreTotalStrokes: number | null;
}) {
  const lines = buildTeamResultsCurrentLines({
    finishingPlacement,
    scoreRelativeToPar,
    scoreTotalStrokes,
  });

  return (
    <>
      {lines.map((line) => (
        <TeamResultsCurrentLine key={line.label} label={line.label} value={line.value} />
      ))}
    </>
  );
}
