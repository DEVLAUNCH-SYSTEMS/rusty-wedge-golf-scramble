import { ORGANIZERS } from "@/lib/content/organizers";
import { buildResultsAnnouncementEmailLogoUrl } from "@/lib/email/results-announcement-email-logo-url";

export type ResultsAnnouncementTemplateInput = {
  tournamentName: string;
  tournamentYear: number;
  recipientFirstName: string;
  resultsUrl: string;
};

export type ResultsAnnouncementEmailContent = {
  subject: string;
  html: string;
  text: string;
};

const BRAND = {
  navy: "#0b1a35",
  navyLogo: "#1e4878",
  gold: "#c8a044",
  gray: "#eef1f5",
  muted: "#64748b",
  white: "#ffffff",
  border: "#e2e8f0",
} as const;

const RESULTS_ANNOUNCEMENT_MESSAGE_PARAGRAPHS = [
  "Thanks to everyone for a great day on Friday! Our tournament was a blast and a huge success!",
  "We look forward to playing golf with everyone throughout the year and hopefully putting it on again next year around a similar time (end of summer).",
  "We will definitely be opting for a shotgun start so that we can all start and finish at about the same time — also looking to grow it into even more players if possible.",
  "Thanks again!",
] as const;

function formatRecipientGreeting(firstName: string): string {
  const trimmed = firstName.trim();

  if (!trimmed) {
    return "Hi there,";
  }

  return `Hi ${trimmed},`;
}

export function buildResultsAnnouncementSubject(
  tournamentName: string,
): string {
  return `${tournamentName} — Results Are Live`;
}

function buildOrganizerContactText(): string {
  return ORGANIZERS.map(
    (organizer) => `${organizer.name} — ${organizer.phone}`,
  ).join("\n");
}

function buildOrganizerContactHtml(): string {
  return ORGANIZERS.map(
    (organizer) =>
      `<li style="margin:0 0 6px;">${organizer.name} — <a href="tel:${organizer.phone}" style="color:${BRAND.navy};text-decoration:none;">${organizer.phone}</a></li>`,
  ).join("");
}

function buildMessageParagraphsHtml(): string {
  return RESULTS_ANNOUNCEMENT_MESSAGE_PARAGRAPHS.map(
    (paragraph) =>
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.navy};">${paragraph}</p>`,
  ).join("");
}

function buildResultsAnnouncementTextBody(
  input: ResultsAnnouncementTemplateInput,
  greeting: string,
): string {
  return [
    greeting,
    "",
    ...RESULTS_ANNOUNCEMENT_MESSAGE_PARAGRAPHS,
    "",
    `View final results: ${input.resultsUrl}`,
    "",
    "Questions? Contact the organizers:",
    buildOrganizerContactText(),
  ].join("\n");
}

function buildEmailHeaderHtml(input: ResultsAnnouncementTemplateInput): string {
  const logoUrl = buildResultsAnnouncementEmailLogoUrl(input.resultsUrl);

  return `<tr>
              <td align="center" style="background:${BRAND.navy};padding:24px 24px 20px;border-bottom:3px solid ${BRAND.gold};">
                <img src="${logoUrl}" alt="The Rusty Wedge Golf Scramble" width="110" height="110" style="display:block;border-radius:9999px;background:${BRAND.navyLogo};padding:8px;border:2px solid ${BRAND.gold};" />
                <p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${BRAND.gold};">${input.tournamentName}</p>
                <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.72);">${input.tournamentYear} Final Results</p>
              </td>
            </tr>`;
}

function buildEmailBodyHtml(greeting: string, resultsUrl: string): string {
  return `<tr>
              <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.navy};">${greeting}</p>
                ${buildMessageParagraphsHtml()}
                <p style="margin:28px 0 8px;text-align:center;">
                  <a href="${resultsUrl}" style="display:inline-block;background:${BRAND.navy};color:${BRAND.white};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;padding:12px 24px;border-radius:9999px;">View Final Results</a>
                </p>
              </td>
            </tr>`;
}

function buildEmailFooterHtml(): string {
  return `<tr>
              <td style="padding:20px 24px;background:${BRAND.gray};border-top:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:${BRAND.navy};">Questions? Contact the organizers:</p>
                <ul style="margin:0;padding:0 0 0 18px;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                  ${buildOrganizerContactHtml()}
                </ul>
              </td>
            </tr>`;
}

function buildResultsAnnouncementHtmlBody(
  input: ResultsAnnouncementTemplateInput,
  greeting: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:${BRAND.gray};">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:${BRAND.gray};">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="max-width:560px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
            ${buildEmailHeaderHtml(input)}
            ${buildEmailBodyHtml(greeting, input.resultsUrl)}
            ${buildEmailFooterHtml()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildResultsAnnouncementEmailContent(
  input: ResultsAnnouncementTemplateInput,
): ResultsAnnouncementEmailContent {
  const greeting = formatRecipientGreeting(input.recipientFirstName);

  return {
    subject: buildResultsAnnouncementSubject(input.tournamentName),
    text: buildResultsAnnouncementTextBody(input, greeting),
    html: buildResultsAnnouncementHtmlBody(input, greeting),
  };
}
