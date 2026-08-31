import { PublicTeamsPage } from "@/components/marketing/public-teams-page";
import { SiteFooter } from "@/components/marketing/site-footer";
import { TeamsNotPublished } from "@/components/marketing/teams-not-published";
import { TournamentUnavailable } from "@/components/marketing/tournament-unavailable";
import {
  buildPublicNavLinks,
  buildPublicRegisterHref,
} from "@/lib/content/landing-content";
import {
  loadPublicTeamsPageData,
  type PublicTeamsPageData,
} from "@/lib/services/public-teams-page";

function buildTeamsPageNavLinks(pageData: PublicTeamsPageData) {
  if (pageData.status === "no_tournament") {
    return buildPublicNavLinks({
      teamsPublished: false,
      resultsPublished: false,
      anchorBase: "/",
    });
  }

  return buildPublicNavLinks({
    ...pageData.publication,
    anchorBase: "/",
  });
}

function renderTeamsPageContent(pageData: PublicTeamsPageData) {
  const navLinks = buildTeamsPageNavLinks(pageData);
  const registerHref = buildPublicRegisterHref("/");

  if (pageData.status === "no_tournament") {
    return <TournamentUnavailable navLinks={navLinks} />;
  }

  if (pageData.status === "not_published") {
    return (
      <TeamsNotPublished
        tournament={pageData.tournament}
        navLinks={navLinks}
        registerHref={registerHref}
      />
    );
  }

  return (
    <PublicTeamsPage
      tournament={pageData.tournament}
      teams={pageData.teams}
      navLinks={navLinks}
      registerHref={registerHref}
      mode={pageData.status === "results" ? "results" : "roster"}
    />
  );
}

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const pageData = await loadPublicTeamsPageData();

  return (
    <>
      {renderTeamsPageContent(pageData)}
      <SiteFooter />
    </>
  );
}
