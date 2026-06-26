export const HERO_EYEBROW = "ANNUAL GOLF SCRAMBLE";

export const HERO_TAGLINE = "Come Have Some Fun With Us!";

export const HERO_SUPPORTING =
  "Carts included — prizes for all — great company guaranteed.";

export const HERO_SECONDARY_CTA = {
  label: "View Details",
  href: "#about",
} as const;

export const NAV_LINKS = [
  { href: "#about", label: "Event Details" },
  { href: "#trophy", label: "Trophy" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
] as const;

export const INFO_SECTION = {
  label: "EVENT DETAILS",
  title: "Everything You Need to Know",
  subtitle: "Mark your calendar and join us for a day you won't forget.",
  included: "Carts Included",
  awards: "Prizes For All",
  format: "4-Person Scramble",
  teeTimeSuffix: "Sharp",
} as const;

export const FORMAT_SECTION = {
  label: "TOURNAMENT FORMAT",
  titleBefore: "4-Person Best Ball ",
  titleAccent: "Scramble",
  body: "Teams will be organized using player skill levels and preferred player requests whenever possible.",
  features: [
    { title: "4 Players", subtitle: "Per Team" },
    { title: "Scramble", subtitle: "Format" },
    { title: "Balanced", subtitle: "Teams by Organizers" },
    { title: "All Skill", subtitle: "Levels Welcome" },
  ],
} as const;

export const TROPHY_SECTION = {
  label: "PRIZES & AWARDS",
  title: "Compete for the Highly Prized Rusty Wedge Trophy",
  titleAccent: "Highly Prized",
  body: "Bragging rights are on the line. The champion earns the highly prized trophy in the scramble — and everyone on the winning team goes home a legend.",
  highlights: [
    { value: "1st Place", label: "Trophy" },
    { value: "Prizes", label: "For Every Team" },
    { value: "100%", label: "Fun Guaranteed" },
  ],
} as const;

export const EXPERIENCE_SECTION = {
  label: "THE EXPERIENCE",
  title: "More Than a Golf Tournament",
  subtitle:
    "The Rusty Wedge brings together golfers of all levels for a day of fun, friendly competition, and great company.",
  cards: [
    {
      title: "Golf",
      body: "Enjoy a full day on the course with friends. A scramble format means everyone contributes — no matter your skill level.",
      accent: "green",
    },
    {
      title: "Competition",
      body: "Compete for prizes and the highly prized Rusty Wedge Trophy. Friendly stakes make every hole exciting.",
      accent: "gold",
    },
    {
      title: "Community",
      body: "Spend the day with great people and create new memories. The Rusty Wedge is a tradition built on good times.",
      accent: "blue",
    },
  ],
} as const;

export const REGISTRATION_SECTION = {
  label: "REGISTRATION",
  title: "Ready to Play? Secure Your Spot.",
  entryFeeLabel: "ENTRY FEE",
  priceLabel: "Per Player",
  includes: ["Green Fees", "Cart", "Tournament Entry", "Prize Eligibility"],
  description:
    "Registration is per player — teams are created by tournament organizers using skill levels and preferred player requests. Once submitted, your spot is reserved after payment is verified.",
  howItWorksLabel: "HOW IT WORKS",
  howItWorks: [
    "Complete registration form",
    "Submit Venmo payment",
    "Upload payment confirmation",
    "Organizers review & verify",
    "Spot confirmed — see you on the course!",
  ],
} as const;

export const REGISTRATION_FORM = {
  title: "Player Registration",
  subtitle:
    "Registration is per player. All fields required unless marked optional.",
  skillHelper:
    "Based on your best score ever on an 18-hole round. This helps organizers create balanced teams. and ensure a fun experience for all players.",
  preferredPlayersLabel: "Preferred players (optional)",
  notesPlaceholder:
    "List any golfers you would like to play with. Tournament organizers will make every effort to accommodate requests while maintaining balanced and competitive teams.",
} as const;

export const SUPPORT_SECTION = {
  label: "CONTACT",
  title: "Questions About Registration?",
  subtitle: "Reach out to our organizers — we're happy to help.",
  organizerRole: "Event Organizer",
  contactButton: "Contact",
} as const;

export const FOOTER = {
  title: "Rusty Wedge Golf Scramble",
  highlights: ["Carts Included", "Prizes For All", "Great Company Guaranteed"],
  organizerLoginLabel: "Organizer Login",
  copyright: "The Rusty Wedge Golf Scramble. All rights reserved.",
} as const;
