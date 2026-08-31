import { AdminActionFormBody } from "@/components/admin/admin-action-form-body";
import { PlacementInputField } from "@/components/admin/placement-input-field";
import { resolveAdminFormDisabledMessage } from "@/components/admin/resolve-admin-form-disabled-message";
import { usePlacementSaveForm } from "@/hooks/use-placement-save-form";

type PlacementSaveFormProps = {
  teamId: string;
  finishingPlacement: number | null;
  disabled: boolean;
  disabledMessage?: string;
};

export function PlacementSaveForm(props: PlacementSaveFormProps) {
  const form = usePlacementSaveForm(props.teamId, props.disabled);

  return (
    <AdminActionFormBody
      disabled={props.disabled}
      danger={false}
      isPending={form.isPending}
      submitLabel="Save placement"
      pendingLabel="Saving…"
      displayMessage={resolveAdminFormDisabledMessage(
        props.disabled,
        props.disabledMessage,
        form.message,
      )}
      onSubmit={form.savePlacement}
    >
      <PlacementInputField finishingPlacement={props.finishingPlacement} />
    </AdminActionFormBody>
  );
}
