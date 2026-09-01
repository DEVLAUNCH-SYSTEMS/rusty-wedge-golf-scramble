export function resultsAnnouncementSmokeTestDescription(): string {
  return "Development only. Sends one test email to the configured smoke recipient. Does not update announcement status or audit events.";
}

export function resultsAnnouncementSmokeTestAcknowledgementCopy(): string {
  return "I understand this sends one real email to the configured smoke-test inbox only.";
}
