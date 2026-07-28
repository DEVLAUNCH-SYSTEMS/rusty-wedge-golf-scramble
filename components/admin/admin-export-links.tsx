import { adminCardClassName, adminSecondaryButtonClassName } from "@/components/admin/admin-form-styles";
import {
  adminBodyTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";

import type { AdminExportHrefs } from "@/lib/services/admin-export-hrefs";

type AdminExportLinksProps = {
  hrefs: AdminExportHrefs;
};

export function AdminExportLinks({ hrefs }: AdminExportLinksProps) {
  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>CSV export</h2>
      <p className={`${adminBodyTextClassName} mt-2`}>
        Download tournament data for event-day records and post-event archiving.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={hrefs.registrations} className={adminSecondaryButtonClassName}>
          Export registrations
        </a>
        <a href={hrefs.teams} className={adminSecondaryButtonClassName}>
          Export teams
        </a>
      </div>
    </section>
  );
}
