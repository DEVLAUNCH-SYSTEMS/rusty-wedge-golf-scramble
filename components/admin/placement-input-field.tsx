import { adminInputClassName, adminLabelClassName } from "@/components/admin/admin-form-styles";

export function PlacementInputField({
  finishingPlacement,
}: {
  finishingPlacement: number | null;
}) {
  return (
    <label className={adminLabelClassName}>
      Finishing placement
      <input
        type="number"
        name="finishingPlacement"
        min={1}
        step={1}
        required
        defaultValue={finishingPlacement ?? undefined}
        className={adminInputClassName}
      />
    </label>
  );
}
