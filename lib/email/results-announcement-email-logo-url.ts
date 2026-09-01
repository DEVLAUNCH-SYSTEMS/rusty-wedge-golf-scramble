/** Same logo asset as the live Vercel deployment; reachable by external email clients during local dev. */
export const RESULTS_ANNOUNCEMENT_PUBLIC_LOGO_ORIGIN =
  "https://rusty-wedge-golf-scramble.vercel.app";

const LOCAL_EMAIL_LOGO_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

export function buildResultsAnnouncementEmailLogoUrl(resultsUrl: string): string {
  const parsedResultsUrl = new URL(resultsUrl);
  const logoOrigin = LOCAL_EMAIL_LOGO_HOSTNAMES.has(parsedResultsUrl.hostname)
    ? RESULTS_ANNOUNCEMENT_PUBLIC_LOGO_ORIGIN
    : parsedResultsUrl.origin;

  return `${logoOrigin}/images/logo-hero.png`;
}
