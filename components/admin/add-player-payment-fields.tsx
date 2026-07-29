import { AddPlayerPaymentProofField } from "@/components/admin/add-player-payment-proof-field";
import { AddPlayerPaymentStatusField } from "@/components/admin/add-player-payment-status-field";

export function AddPlayerPaymentFields() {
  return (
    <div className="flex flex-col gap-4">
      <AddPlayerPaymentStatusField />
      <AddPlayerPaymentProofField />
    </div>
  );
}
