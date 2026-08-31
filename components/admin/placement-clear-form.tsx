import { AdminActionFormBody } from "@/components/admin/admin-action-form-body";
import { resolveAdminFormDisabledMessage } from "@/components/admin/resolve-admin-form-disabled-message";
import { usePlacementClearForm } from "@/hooks/use-placement-clear-form";

function ClearPlacementFormBody(props: {
  teamId: string;
  disabled: boolean;
  disabledMessage?: string;
}) {
  const form = usePlacementClearForm(props.teamId, props.disabled);

  return (
    <AdminActionFormBody
      disabled={props.disabled}
      danger
      isPending={form.isPending}
      submitLabel="Clear placement"
      pendingLabel="Clearing…"
      displayMessage={resolveAdminFormDisabledMessage(
        props.disabled,
        props.disabledMessage,
        form.message,
      )}
      formClassName="flex flex-col gap-4 border-t border-slate-200 pt-4"
      onSubmit={form.clearPlacement}
    >
      <span className="sr-only">Clear finishing placement</span>
    </AdminActionFormBody>
  );
}

export function PlacementClearForm(props: {
  teamId: string;
  disabled: boolean;
  disabledMessage?: string;
  hasPlacement: boolean;
}) {
  if (!props.hasPlacement) {
    return null;
  }

  return (
    <ClearPlacementFormBody
      teamId={props.teamId}
      disabled={props.disabled}
      disabledMessage={props.disabledMessage}
    />
  );
}
