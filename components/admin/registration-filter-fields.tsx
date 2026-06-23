import Link from "next/link";

import {
  adminButtonClassName,
  adminInputClassName,
  adminLabelClassName,
  adminSecondaryButtonClassName,
} from "@/components/admin/admin-form-styles";

import type { AdminRegistrationListFilters } from "@/lib/validation/admin-filters";

type FilterSelectProps = {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
};

export function FilterSelect({ name, label, value, options }: FilterSelectProps) {
  return (
    <label className={adminLabelClassName}>
      {label}
      <select name={name} defaultValue={value} className={adminInputClassName}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RegistrationSearchFilter({ query }: { query: string }) {
  return (
    <label className={adminLabelClassName}>
      Search
      <input
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Name or email"
        className={adminInputClassName}
      />
    </label>
  );
}

export const REGISTRATION_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending review" },
  { value: "confirmed", label: "Confirmed" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "not_submitted", label: "Not submitted" },
  { value: "submitted", label: "Submitted" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;

export const SKILL_OPTIONS = [
  { value: "all", label: "All" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
] as const;

export const ASSIGNMENT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "assigned", label: "Assigned" },
  { value: "unassigned", label: "Unassigned" },
] as const;

export function RegistrationStatusFilters({
  filters,
}: {
  filters: AdminRegistrationListFilters;
}) {
  return (
    <>
      <FilterSelect
        name="registrationStatus"
        label="Registration status"
        value={filters.registrationStatus}
        options={[...REGISTRATION_STATUS_OPTIONS]}
      />
      <FilterSelect
        name="paymentStatus"
        label="Payment status"
        value={filters.paymentStatus}
        options={[...PAYMENT_STATUS_OPTIONS]}
      />
    </>
  );
}

export function RegistrationFilterGrid({ filters }: { filters: AdminRegistrationListFilters }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <RegistrationSearchFilter query={filters.q ?? ""} />
      <RegistrationStatusFilters filters={filters} />
      <FilterSelect
        name="skillLevel"
        label="Skill level"
        value={filters.skillLevel}
        options={[...SKILL_OPTIONS]}
      />
      <FilterSelect
        name="assignment"
        label="Team assignment"
        value={filters.assignment}
        options={[...ASSIGNMENT_OPTIONS]}
      />
    </div>
  );
}

export function RegistrationFilterActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="submit" className={adminButtonClassName}>
        Apply filters
      </button>
      <Link href="/admin/registrations" className={adminSecondaryButtonClassName}>
        Clear
      </Link>
    </div>
  );
}
