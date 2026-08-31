import { adminInputClassName } from "@/components/admin/admin-form-styles";

export function BulkPlacementRowInput({
  teamId,
  teamNumber,
  finishingPlacement,
}: {
  teamId: string;
  teamNumber: number | null;
  finishingPlacement: number | null;
}) {
  const teamLabel = teamNumber == null ? "team" : `Team #${teamNumber}`;

  return (
    <>
      <input type="hidden" name="teamIds" value={teamId} />
      <input
        type="number"
        name={`placement_${teamId}`}
        min={1}
        step={1}
        defaultValue={finishingPlacement ?? undefined}
        aria-label={`Finishing placement for ${teamLabel}`}
        className={`${adminInputClassName} max-w-24`}
      />
    </>
  );
}
