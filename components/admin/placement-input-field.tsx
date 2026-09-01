import { adminInputClassName, adminLabelClassName } from "@/components/admin/admin-form-styles";

export function PlacementInputField({
  finishingPlacement,
  required = true,
}: {
  finishingPlacement: number | null;
  required?: boolean;
}) {
  return (
    <label className={adminLabelClassName}>
      Finishing placement
      <input
        type="number"
        name="finishingPlacement"
        min={1}
        step={1}
        required={required}
        defaultValue={finishingPlacement ?? undefined}
        className={adminInputClassName}
      />
    </label>
  );
}
