import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { isResultsAnnouncementEligibleEmail } from "@/lib/domain/results-announcement-eligible-email";
import { normalizePlayerEmail } from "@/lib/validation/player-profile";

export type ResultsAnnouncementRecipient = {
  registrationId: string;
  email: string;
  firstName: string;
  lastName: string;
};

type RegistrationRecipientRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
};

export function dedupeResultsAnnouncementRecipients(
  rows: RegistrationRecipientRow[],
): ResultsAnnouncementRecipient[] {
  const sortedRows = [...rows].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );
  const seenEmails = new Set<string>();
  const recipients: ResultsAnnouncementRecipient[] = [];

  for (const row of sortedRows) {
    const normalizedEmail = normalizePlayerEmail(row.email);

    if (!normalizedEmail || !isResultsAnnouncementEligibleEmail(normalizedEmail)) {
      continue;
    }

    if (seenEmails.has(normalizedEmail)) {
      continue;
    }

    seenEmails.add(normalizedEmail);
    recipients.push({
      registrationId: row.id,
      email: normalizedEmail,
      firstName: row.firstName,
      lastName: row.lastName,
    });
  }

  return recipients;
}

export async function listResultsAnnouncementRecipients(
  tournamentId: string,
): Promise<ResultsAnnouncementRecipient[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: registrations.id,
      email: registrations.email,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.registrationStatus, "confirmed"),
      ),
    )
    .orderBy(asc(registrations.createdAt));

  return dedupeResultsAnnouncementRecipients(rows);
}

export type ResultsAnnouncementRecipientSummary = {
  recipients: ResultsAnnouncementRecipient[];
  recipientCount: number;
};

export async function loadResultsAnnouncementRecipientSummary(
  tournamentId: string,
): Promise<ResultsAnnouncementRecipientSummary> {
  const recipients = await listResultsAnnouncementRecipients(tournamentId);

  return {
    recipients,
    recipientCount: recipients.length,
  };
}
