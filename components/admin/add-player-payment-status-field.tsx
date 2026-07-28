import {
  adminInputClassName,
  adminLabelClassName,
} from "@/components/admin/admin-form-styles";

const PAYMENT_STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted (verify later)" },
  { value: "verified", label: "Verified (confirm if capacity allows)" },
] as const;

export function AddPlayerPaymentStatusField() {
  return (
    <label className={adminLabelClassName}>
      Payment status
      <select
        name="paymentStatus"
        required
        defaultValue="submitted"
        className={adminInputClassName}
      >
        {PAYMENT_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
