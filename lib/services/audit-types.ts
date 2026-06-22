export const AUDIT_EVENT_TYPES = {
  paymentVerified: "payment_verified",
  paymentRejected: "payment_rejected",
  registrationCancelled: "registration_cancelled",
  waitlistPromoted: "waitlist_promoted",
  teamCreated: "team_created",
  playerAssignedToTeam: "player_assigned_to_team",
  playerRemovedFromTeam: "player_removed_from_team",
  adminNotesUpdated: "admin_notes_updated",
  verifyBlockedCapacity: "verify_blocked_capacity",
} as const;

export type AuditEventType =
  (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];

export type RecordAuditEventInput = {
  tournamentId: string;
  eventType: AuditEventType;
  adminUserId: string;
  registrationId?: string;
  waitlistEntryId?: string;
  teamId?: string;
  metadata?: Record<string, unknown>;
};
