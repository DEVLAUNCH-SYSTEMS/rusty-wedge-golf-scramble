"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { sendResultsAnnouncementSmokeTestAction } from "@/lib/actions/admin-results-announcement-smoke-test";
import {
  resultsAnnouncementSmokeTestAcknowledgementCopy,
  resultsAnnouncementSmokeTestDescription,
} from "@/lib/content/results-announcement-smoke-test-copy";

export function ResultsAnnouncementSmokeTestPanel() {
  return (
    <AdminActionForm
      title="Results announcement smoke test"
      submitLabel="Send smoke test"
      pendingLabel="Sending smoke test…"
      onSubmit={sendResultsAnnouncementSmokeTestAction}
    >
      <p className="text-sm text-muted-foreground">
        {resultsAnnouncementSmokeTestDescription()}
      </p>
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          className="mt-1"
          type="checkbox"
          name="smokeTestAcknowledged"
          value="yes"
        />
        <span>{resultsAnnouncementSmokeTestAcknowledgementCopy()}</span>
      </label>
    </AdminActionForm>
  );
}
