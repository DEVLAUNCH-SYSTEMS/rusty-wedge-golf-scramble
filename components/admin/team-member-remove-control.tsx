"use client";

import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { adminDangerButtonClassName } from "@/components/admin/admin-form-styles";

export function TeamMemberRemoveControl(props: {
  playerName: string;
  disabled: boolean;
  isPending: boolean;
  message: { tone: "success" | "error"; text: string } | null;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={props.disabled || props.isPending}
        className={adminDangerButtonClassName}
        onClick={props.onRemove}
      >
        {props.isPending ? "Removing…" : `Remove ${props.playerName}`}
      </button>
      <AdminActionMessage message={props.message} />
    </div>
  );
}
