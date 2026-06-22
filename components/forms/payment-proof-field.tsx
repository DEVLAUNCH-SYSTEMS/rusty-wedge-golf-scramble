import { formInputClassName, formLabelClassName } from "@/components/forms/form-field-styles";

export function PaymentProofField() {
  return (
    <label className={formLabelClassName}>
      Payment proof (JPG, PNG, or PDF)
      <input
        name="paymentProof"
        type="file"
        required
        accept="image/jpeg,image/png,application/pdf"
        className={formInputClassName}
      />
    </label>
  );
}
