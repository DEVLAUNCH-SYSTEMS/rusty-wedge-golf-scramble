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

function buildTeamsPageNavLinks(teamsPublished: boolean) {
  return buildPublicNavLinks({
    teamsPublished,
    anchorBase: "/",
  });
}

function renderTeamsPageContent(pageData: PublicTeamsPageData) {
  const teamsPublished = pageData.status === "published";
  const navLinks = buildTeamsPageNavLinks(teamsPublished);
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
