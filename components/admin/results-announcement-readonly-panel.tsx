import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { adminSectionTitleClassName } from "@/components/admin/admin-text-styles";
import { ResultsAnnouncementStatus } from "@/components/admin/results-announcement-status";

import type { ResultsAnnouncementPanelView } from "@/lib/content/results-announcement-panel-view";

export function ResultsAnnouncementReadonlyPanel({
  view,
}: {
  view: ResultsAnnouncementPanelView;
}) {
  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Results announcement email</h2>
      <ResultsAnnouncementStatus
        statusLabel={view.statusLabel}
        statusTone={view.statusTone}
        statusDescription={view.statusDescription}
        recipientCount={view.recipientCount}
      />
      {view.disabledMessage ? (
        <p className="mt-3 text-sm text-red-700">{view.disabledMessage}</p>
      ) : null}
    </section>
  );
}
