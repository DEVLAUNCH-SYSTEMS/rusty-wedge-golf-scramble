type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const TONE_CLASSES = {
  neutral: "bg-rw-gray text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-800",
  info: "bg-sky-100 text-sky-800",
} as const;

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function registrationStatusTone(
  status: string,
): StatusBadgeProps["tone"] {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending_review":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): StatusBadgeProps["tone"] {
  switch (status) {
    case "verified":
      return "success";
    case "submitted":
      return "info";
    case "rejected":
      return "danger";
    default:
      return "neutral";
  }
}
