export function resultsAnnouncementRecipientDescription(
  recipientCount: number,
): string {
  const label = recipientCount === 1 ? "confirmed participant" : "confirmed participants";
  return `One-time email to ${recipientCount} ${label} with a link to public Results.`;
}

export function resultsAnnouncementAcknowledgementCopy(recipientCount: number): string {
  const label = recipientCount === 1 ? "participant" : "participants";
  return `I understand this sends a one-time email to all ${recipientCount} confirmed ${label} and cannot be undone.`;
}

export function resultsAnnouncementVerifyDescription(): string {
  return "Checks the provider using the same idempotency key. Do not use Send again until verification completes.";
}
