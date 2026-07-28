"use client";

import { adminLabelClassName } from "@/components/admin/admin-form-styles";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";

export type AddPlayerPlacement = "registration" | "waitlist";

type AddPlayerPlacementFieldProps = {
  placement: AddPlayerPlacement;
  onPlacementChange: (placement: AddPlayerPlacement) => void;
};

const PLACEMENT_OPTIONS = [
  { value: "registration" as const, label: "Registration" },
  { value: "waitlist" as const, label: "Waitlist" },
];

function PlacementOption(props: {
  value: AddPlayerPlacement;
  label: string;
  checked: boolean;
  onSelect: (placement: AddPlayerPlacement) => void;
}) {
  return (
    <label
      className={`${adminLabelClassName} flex cursor-pointer items-center gap-2 font-normal`}
    >
      <input
        type="radio"
        name="placement"
        value={props.value}
        checked={props.checked}
        onChange={() => {
          props.onSelect(props.value);
        }}
        className="size-4 accent-rw-navy"
      />
      {props.label}
    </label>
  );
}

export function AddPlayerPlacementField(props: AddPlayerPlacementFieldProps) {
  return (
    <fieldset className="border-0 p-0">
      <legend className={adminLabelClassName}>Placement</legend>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
        {PLACEMENT_OPTIONS.map((option) => (
          <PlacementOption
            key={option.value}
            value={option.value}
            label={option.label}
            checked={props.placement === option.value}
            onSelect={props.onPlacementChange}
          />
        ))}
      </div>
      <span className={`${adminMutedTextClassName} mt-1 block`}>
        Waitlist skips payment controls. Registration can set payment status.
      </span>
    </fieldset>
  );
}
