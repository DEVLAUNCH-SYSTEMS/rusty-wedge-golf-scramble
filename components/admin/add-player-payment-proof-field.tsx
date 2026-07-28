import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";
import { adminMutedTextClassName } from "@/components/admin/admin-text-styles";

export function AddPlayerPaymentProofField() {
  return (
    <label className={adminLabelClassName}>
      Payment proof (optional)
      <input
        type="file"
        name="paymentProof"
        accept="image/jpeg,image/png,application/pdf"
        className={adminInputClassName}
      />
      <span className={`${adminMutedTextClassName} mt-1 block`}>
        JPG, PNG, or PDF up to 5 MB. Optional for submitted or verified.
      </span>
    </label>
  );
}
