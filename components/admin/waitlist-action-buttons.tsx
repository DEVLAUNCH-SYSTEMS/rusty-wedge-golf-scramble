"use client";

import {
  adminButtonClassName,
  adminDangerButtonClassName,
} from "@/components/admin/admin-form-styles";

function PromoteWaitlistButton(props: {
  disabled: boolean;
  isPending: boolean;
  onPromote: () => void;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled || props.isPending}
      className={`${adminButtonClassName} w-full sm:w-auto`}
      onClick={props.onPromote}
    >
      {props.isPending ? "Working…" : "Promote"}
    </button>
  );
}

function RemoveWaitlistButton(props: {
  disabled: boolean;
  isPending: boolean;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled || props.isPending}
      className={`${adminDangerButtonClassName} w-full sm:w-auto`}
      onClick={props.onRemove}
    >
      Remove
    </button>
  );
}

export function WaitlistActionButtons(props: {
  disabled: boolean;
  isPending: boolean;
  onPromote: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <PromoteWaitlistButton
        disabled={props.disabled}
        isPending={props.isPending}
        onPromote={props.onPromote}
      />
      <RemoveWaitlistButton
        disabled={props.disabled}
        isPending={props.isPending}
        onRemove={props.onRemove}
      />
    </div>
  );
}
