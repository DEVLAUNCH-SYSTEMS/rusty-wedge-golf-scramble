import Link from "next/link";

import {
  adminCardClassName,
  adminCardHoverClassName,
} from "@/components/admin/admin-form-styles";
import { adminBodyTextClassName } from "@/components/admin/admin-text-styles";

type MetricCardProps = {
  label: string;
  value: string;
  href?: string;
};

function MetricCardContent({ label, value }: Pick<MetricCardProps, "label" | "value">) {
  return (
    <>
      <p className={adminBodyTextClassName}>{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-rw-navy">{value}</p>
    </>
  );
}

export function MetricCard({ label, value, href }: MetricCardProps) {
  if (!href) {
    return (
      <div className={adminCardClassName}>
        <MetricCardContent label={label} value={value} />
      </div>
    );
  }

  return (
    <Link href={href} className={`${adminCardClassName} ${adminCardHoverClassName} block`}>
      <MetricCardContent label={label} value={value} />
    </Link>
  );
}
