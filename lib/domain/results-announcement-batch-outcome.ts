export type ResultsAnnouncementBatchOutcome =
  | {
      kind: "full_success";
      recipientCount: number;
      successCount: number;
      providerBatchIds: string[];
    }
  | {
      kind: "partial";
      recipientCount: number;
      successCount: number;
      failureCount: number;
      providerBatchIds: string[];
    }
  | {
      kind: "known_failure";
      message: string;
    }
  | {
      kind: "ambiguous";
      message: string;
    };

export type ResultsAnnouncementStatus =
  | "not_sent"
  | "sending"
  | "sent"
  | "partial"
  | "ambiguous";
