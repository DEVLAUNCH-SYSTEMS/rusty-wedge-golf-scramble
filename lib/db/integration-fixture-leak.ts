import { classifyFixtureTeamName } from "@/lib/db/team-number-fixture-patterns";

export const INTEGRATION_TEST_EMAIL_DOMAIN = "@example.com";
export const INTEGRATION_ADMIN_NEON_AUTH_PREFIX = "test-admin-";
export const INTEGRATION_TEST_TOURNAMENT_YEAR_MIN = 2080;
export const INTEGRATION_TEST_TOURNAMENT_YEAR_MAX = 2099;

export type IntegrationFixtureLeakCounts = {
  fixtureCatalogTeams: number;
  integrationAdminUsers: number;
  integrationRegistrations: number;
  integrationWaitlistEntries: number;
  integrationTestTournaments: number;
};

export type IntegrationFixtureLeakRow = {
  kind:
    | "fixture_team"
    | "integration_admin"
    | "integration_registration"
    | "integration_waitlist"
    | "integration_tournament";
  id: string;
  label: string;
};

export type IntegrationFixtureLeakReport = {
  counts: IntegrationFixtureLeakCounts;
  samples: IntegrationFixtureLeakRow[];
  hasLeaks: boolean;
};

export function integrationTestEmailPattern(): string {
  return `%${INTEGRATION_TEST_EMAIL_DOMAIN}`;
}

export function isIntegrationTestEmail(email: string): boolean {
  return email.endsWith(INTEGRATION_TEST_EMAIL_DOMAIN);
}

export function isIntegrationAdminNeonAuthUserId(neonAuthUserId: string): boolean {
  return neonAuthUserId.startsWith(INTEGRATION_ADMIN_NEON_AUTH_PREFIX);
}

export function isIntegrationTestTournamentYear(year: number): boolean {
  return (
    year >= INTEGRATION_TEST_TOURNAMENT_YEAR_MIN &&
    year <= INTEGRATION_TEST_TOURNAMENT_YEAR_MAX
  );
}

function countFixtureCatalogTeams(
  teams: Array<{ id: string; name: string }>,
  samples: IntegrationFixtureLeakRow[],
): number {
  return teams.filter((team) => {
    const match = classifyFixtureTeamName(team.name);

    if (match) {
      samples.push({ kind: "fixture_team", id: team.id, label: team.name });
    }

    return Boolean(match);
  }).length;
}

function countIntegrationAdmins(
  adminUsers: Array<{ id: string; email: string; neonAuthUserId: string }>,
  samples: IntegrationFixtureLeakRow[],
): number {
  return adminUsers.filter((admin) => {
    if (!isIntegrationAdminNeonAuthUserId(admin.neonAuthUserId)) {
      return false;
    }

    samples.push({ kind: "integration_admin", id: admin.id, label: admin.email });
    return true;
  }).length;
}

function countIntegrationEmails(
  rows: Array<{ id: string; email: string }>,
  kind: "integration_registration" | "integration_waitlist",
  samples: IntegrationFixtureLeakRow[],
): number {
  return rows.filter((row) => {
    if (!isIntegrationTestEmail(row.email)) {
      return false;
    }

    samples.push({ kind, id: row.id, label: row.email });
    return true;
  }).length;
}

function countIntegrationTestTournaments(
  tournaments: Array<{ id: string; slug: string; year: number }>,
  samples: IntegrationFixtureLeakRow[],
): number {
  return tournaments.filter((tournament) => {
    if (!isIntegrationTestTournamentYear(tournament.year)) {
      return false;
    }

    samples.push({
      kind: "integration_tournament",
      id: tournament.id,
      label: `${tournament.slug} (${tournament.year})`,
    });

    return true;
  }).length;
}

type LeakCountInput = {
  teams: Array<{ id: string; name: string }>;
  adminUsers: Array<{ id: string; email: string; neonAuthUserId: string }>;
  registrations: Array<{ id: string; email: string }>;
  waitlistEntries: Array<{ id: string; email: string }>;
  tournaments: Array<{ id: string; slug: string; year: number }>;
  samples: IntegrationFixtureLeakRow[];
};

function buildIntegrationFixtureLeakCounts(input: LeakCountInput): IntegrationFixtureLeakCounts {
  return {
    fixtureCatalogTeams: countFixtureCatalogTeams(input.teams, input.samples),
    integrationAdminUsers: countIntegrationAdmins(input.adminUsers, input.samples),
    integrationRegistrations: countIntegrationEmails(
      input.registrations,
      "integration_registration",
      input.samples,
    ),
    integrationWaitlistEntries: countIntegrationEmails(
      input.waitlistEntries,
      "integration_waitlist",
      input.samples,
    ),
    integrationTestTournaments: countIntegrationTestTournaments(
      input.tournaments,
      input.samples,
    ),
  };
}

export function summarizeIntegrationFixtureLeaks(input: {
  teams: Array<{ id: string; name: string }>;
  adminUsers: Array<{ id: string; email: string; neonAuthUserId: string }>;
  registrations: Array<{ id: string; email: string }>;
  waitlistEntries: Array<{ id: string; email: string }>;
  tournaments: Array<{ id: string; slug: string; year: number }>;
}): IntegrationFixtureLeakReport {
  const samples: IntegrationFixtureLeakRow[] = [];
  const counts = buildIntegrationFixtureLeakCounts({ ...input, samples });

  return {
    counts,
    samples: samples.slice(0, 25),
    hasLeaks: Object.values(counts).some((count) => count > 0),
  };
}

export function integrationFixtureCountsIncreased(
  before: IntegrationFixtureLeakCounts,
  after: IntegrationFixtureLeakCounts,
): boolean {
  return (
    after.fixtureCatalogTeams > before.fixtureCatalogTeams ||
    after.integrationAdminUsers > before.integrationAdminUsers ||
    after.integrationRegistrations > before.integrationRegistrations ||
    after.integrationWaitlistEntries > before.integrationWaitlistEntries ||
    after.integrationTestTournaments > before.integrationTestTournaments
  );
}

export function formatIntegrationFixtureLeakIncrease(
  before: IntegrationFixtureLeakCounts,
  after: IntegrationFixtureLeakCounts,
): string {
  return [
    "Integration test increased persistent fixture counts.",
    `Before: ${JSON.stringify(before)}`,
    `After:  ${JSON.stringify(after)}`,
    "",
    "Every DB-backed integration test must register fixtures and clean them up.",
    "Use emergency recovery on the dev branch only via documented tooling.",
  ].join("\n");
}

export function formatIntegrationFixtureLeakReport(
  report: IntegrationFixtureLeakReport,
): string {
  const lines = [
    "Integration fixture leak detected after test cleanup.",
    `Counts: ${JSON.stringify(report.counts)}`,
  ];

  if (report.samples.length > 0) {
    lines.push("", "Sample leaked rows (up to 25):");

    for (const sample of report.samples) {
      lines.push(`  [${sample.kind}] ${sample.id} — ${sample.label}`);
    }
  }

  lines.push(
    "",
    "Every DB-backed integration test must register fixtures and clean them up.",
    "Use emergency recovery only via npm run db:fixture-team-cleanup on the dev branch.",
  );

  return lines.join("\n");
}
