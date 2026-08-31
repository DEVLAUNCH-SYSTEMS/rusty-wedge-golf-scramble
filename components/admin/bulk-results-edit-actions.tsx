import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { BulkResultsSaveCancelButtons } from "@/components/admin/bulk-results-edit-controls";

type FormMessage = { tone: "success" | "error"; text: string };

export function BulkResultsEditActions({
  isPending,
  message,
  onCancel,
}: {
  isPending: boolean;
  message: FormMessage | null;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
      <AdminActionMessage message={message} />
      <BulkResultsSaveCancelButtons isPending={isPending} onCancel={onCancel} />
    </div>
  );
}
