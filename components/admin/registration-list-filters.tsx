import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  RegistrationFilterActions,
  RegistrationFilterGrid,
} from "@/components/admin/registration-filter-fields";

import type { AdminRegistrationListFilters } from "@/lib/validation/admin-filters";

type RegistrationListFiltersProps = {
  filters: AdminRegistrationListFilters;
};

export function RegistrationListFilters({ filters }: RegistrationListFiltersProps) {
  return (
    <form method="get" className={`grid gap-4 ${adminCardClassName}`}>
      <RegistrationFilterGrid filters={filters} />
      <RegistrationFilterActions />
    </form>
  );
}
