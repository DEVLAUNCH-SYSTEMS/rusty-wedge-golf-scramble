import { FormatSection } from "@/components/marketing/format-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { InfoGridSection } from "@/components/marketing/info-grid-section";
import { MissionSection } from "@/components/marketing/mission-section";
import { SupportSection } from "@/components/marketing/support-section";
import { TrophySection } from "@/components/marketing/trophy-section";
import { RegistrationSection } from "@/components/registration/registration-section";

import type { PublicNavLink } from "@/lib/content/landing-content";
import type { PublicTournamentView } from "@/lib/format/tournament-display";

type TournamentLandingPageProps = {
  tournament: PublicTournamentView;
  hasCapacity: boolean;
  navLinks: readonly PublicNavLink[];
};

export function TournamentLandingPage({
  tournament,
  hasCapacity,
  navLinks,
}: TournamentLandingPageProps) {
  return (
    <main>
      <HeroSection navLinks={navLinks} />
      <InfoGridSection tournament={tournament} />
      <FormatSection />
      <TrophySection />
      <MissionSection />
      <RegistrationSection tournament={tournament} hasCapacity={hasCapacity} />
      <SupportSection />
    </main>
  );
}
