import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { registrations, teamMembers, teams } from "@/lib/db/schema";
import { requireAdminTournamentContext } from "@/lib/services/admin-tournament-context";
import { formatCsvRow } from "@/lib/services/csv";
import { requireTournamentById } from "@/lib/services/tournament";

export { escapeCsvCell, formatCsvRow } from "@/lib/services/csv";

const REGISTRATION_HEADERS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "skill_level",
  "registration_status",
  "payment_status",
  "team_name",
  "preferred_players",
  "notes",
  "payment_review_notes",
  "admin_notes",
  "created_at",
] as const;

type RegistrationExportRow = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skillLevel: string;
  registrationStatus: string;
  paymentStatus: string;
  teamName: string | null;
  preferredPlayers: string | null;
  notes: string | null;
  paymentReviewNotes: string | null;
  adminNotes: string | null;
  createdAt: Date | null;
};

function registrationRowToCsv(row: RegistrationExportRow): string {
  return formatCsvRow([
    row.firstName,
    row.lastName,
    row.email,
    row.phone,
    row.skillLevel,
    row.registrationStatus,
    row.paymentStatus,
    row.teamName,
    row.preferredPlayers,
    row.notes,
    row.paymentReviewNotes,
    row.adminNotes,
    row.createdAt?.toISOString() ?? "",
  ]);
}

export async function exportRegistrationsCsvForTournament(
  tournamentId: string,
): Promise<string> {
  await requireTournamentById(tournamentId);
  const db = getDb();
  const rows = await db
    .select({
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      email: registrations.email,
      phone: registrations.phone,
      skillLevel: registrations.skillLevel,
      registrationStatus: registrations.registrationStatus,
      paymentStatus: registrations.paymentStatus,
      teamName: teams.name,
      preferredPlayers: registrations.preferredPlayers,
      notes: registrations.notes,
      paymentReviewNotes: registrations.paymentReviewNotes,
      adminNotes: registrations.adminNotes,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .leftJoin(teamMembers, eq(teamMembers.registrationId, registrations.id))
    .leftJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(registrations.tournamentId, tournamentId));

  return `${[formatCsvRow([...REGISTRATION_HEADERS]), ...rows.map(registrationRowToCsv)].join("\n")}\n`;
}

export async function exportRegistrationsCsv(): Promise<string> {
  const tournament = await requireAdminTournamentContext();
  return exportRegistrationsCsvForTournament(tournament.id);
}

const TEAM_HEADERS = [
  "team_name",
  "player_first_name",
  "player_last_name",
  "skill_level",
  "assignment_status",
] as const;

function teamRowToCsv(row: {
  teamName: string;
  firstName: string | null;
  lastName: string | null;
  skillLevel: string | null;
}): string {
  return formatCsvRow([
    row.teamName,
    row.firstName ?? "",
    row.lastName ?? "",
    row.skillLevel ?? "",
    row.firstName ? "assigned" : "empty_slot",
  ]);
}

export async function exportTeamsCsvForTournament(
  tournamentId: string,
): Promise<string> {
  await requireTournamentById(tournamentId);
  const db = getDb();
  const rows = await db
    .select({
      teamName: teams.name,
      firstName: registrations.firstName,
      lastName: registrations.lastName,
      skillLevel: registrations.skillLevel,
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .leftJoin(registrations, eq(registrations.id, teamMembers.registrationId))
    .where(eq(teams.tournamentId, tournamentId));

  return `${[formatCsvRow([...TEAM_HEADERS]), ...rows.map(teamRowToCsv)].join("\n")}\n`;
}

export async function exportTeamsCsv(): Promise<string> {
  const tournament = await requireAdminTournamentContext();
  return exportTeamsCsvForTournament(tournament.id);
}
